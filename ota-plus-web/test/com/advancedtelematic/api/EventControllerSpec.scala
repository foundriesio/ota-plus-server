package com.advancedtelematic.api

import akka.NotUsed
import akka.actor.ActorSystem
import akka.stream.Materializer
import akka.stream.scaladsl.{Keep, Source}
import akka.stream.testkit.scaladsl.{TestSink, TestSource}
import akka.util.ByteString
import cats.syntax.show._
import com.advancedtelematic.ota.Messages.MessageWriters._
import eu.timepit.refined.api.Refined
import java.time.Instant
import java.util.UUID
import org.genivi.sota.data.{Device, Namespace, PackageId, Uuid}
import org.genivi.sota.messaging.Messages.{DeviceCreated, DeviceDeleted, DeviceSeen, PackageBlacklisted,
                                           PackageCreated, UpdateSpec}
import org.genivi.webserver.controllers.EventController
import org.genivi.webserver.controllers.messaging.MessageSourceProvider
import org.scalatestplus.play.{OneServerPerSuite, PlaySpec}
import play.api.inject.bind
import play.api.inject.guice.GuiceApplicationBuilder
import play.api.libs.json._
import play.api.mvc._
import play.api.test.FakeRequest
import play.api.test.Helpers._
import scala.reflect.ClassTag

import Device._


object MessagingData {
  val deviceUuid = Uuid(Refined.unsafeApply("77a1888b-9bc8-4673-8f23-a51240303db4"))
  val nonMatchingDeviceUuid = Uuid(Refined.unsafeApply("99a1888b-9bc8-4673-8f23-a51240303db4"))
  val deviceName = DeviceName("testDevice")
  val namespace = Namespace("default")
  val invalidNamespace = Namespace("invalid")
  val lastSeen = Instant.now()
  val deviceSeenMessage = DeviceSeen(namespace, deviceUuid, lastSeen)
  val deviceId = Some(DeviceId("testVin"))
  val deviceType = DeviceType.Vehicle
  val packageId = PackageId(Refined.unsafeApply("ghc"), Refined.unsafeApply("1.0.0"))
  val packageUuid = UUID.fromString("b82ca6a4-5422-47e0-85d0-8f931006a307")
  val deviceCreatedMessage = DeviceCreated(namespace, deviceUuid, deviceName, deviceId, deviceType)
  val deviceDeletedMessage = DeviceDeleted(namespace, deviceUuid)
  val updateSpecMessage = UpdateSpec(namespace, deviceUuid, packageUuid, "Finished")
  val packageBlacklistedMessage = PackageBlacklisted(namespace, packageId)
  val packageCreatedMessage = PackageCreated(namespace, packageId, Some("description"), Some("ghc"), None)
}

class EventControllerSpec extends PlaySpec with OneServerPerSuite with Results {

  protected def getDeviceSeenResponse(msg: DeviceSeen): String = {
    "<html><body><script type=\"text/javascript\">parent.deviceSeen(" + Json.toJson(msg) + ");</script>"
  }

  protected def getDeviceCreatedResponse(msg: DeviceCreated): String = {
    "<html><body><script type=\"text/javascript\">parent.deviceCreated(" + Json.toJson(msg) + ");</script>"
  }

  protected def getDeviceDeletedResponse(msg: DeviceDeleted): String = {
    "<html><body><script type=\"text/javascript\">parent.deviceDeleted(" + Json.toJson(msg) + ");</script>"
  }

  protected def getPackageCreatedResponse(msg: PackageCreated): String = {
    "<html><body><script type=\"text/javascript\">parent.packageCreated(" + Json.toJson(msg) + ");</script>"
  }

  protected def getUpdateSpecResponse(msg: UpdateSpec): String = {
    "<html><body><script type=\"text/javascript\">parent.updateSpec(" + Json.toJson(msg) + ");</script>"
  }

  val mockMsgSrc = new MessageSourceProvider {
    override def getSource[T]()(implicit system: ActorSystem, tag: ClassTag[T]): Source[T, _] = {
      if (tag.runtimeClass.equals(classOf[DeviceSeen])) {
        Source.single(MessagingData.deviceSeenMessage).asInstanceOf[Source[T, NotUsed]]
      } else if(tag.runtimeClass.equals(classOf[DeviceCreated])) {
        Source.single(MessagingData.deviceCreatedMessage).asInstanceOf[Source[T, NotUsed]]
      } else if(tag.runtimeClass.equals(classOf[DeviceDeleted])) {
        Source.single(MessagingData.deviceDeletedMessage).asInstanceOf[Source[T, NotUsed]]
      } else if(tag.runtimeClass.equals(classOf[UpdateSpec])) {
        Source.single(MessagingData.updateSpecMessage).asInstanceOf[Source[T, NotUsed]]
      } else if(tag.runtimeClass.equals(classOf[PackageBlacklisted])) {
        Source.single(MessagingData.packageBlacklistedMessage).asInstanceOf[Source[T, NotUsed]]
      } else if(tag.runtimeClass.equals(classOf[PackageCreated])) {
        Source.single(MessagingData.packageCreatedMessage).asInstanceOf[Source[T, NotUsed]]
      } else {
        throw new IllegalArgumentException("[test] Event class not supported " +
          s"${tag.runtimeClass.getSimpleName}")
      }
    }
  }

  val application = new GuiceApplicationBuilder()
    .overrides(bind[MessageSourceProvider].to(mockMsgSrc))
    .build

  implicit val mat = application.injector.instanceOf[Materializer]

  val controller = application.injector.instanceOf[EventController]

  val emptyRequest = FakeRequest().withBody(RawBuffer(0, ByteString()))

  "EventController" should {

    "route web socket (flow) to client" in {
      def mkJs[T](x: T)(implicit tag: ClassTag[T], tWrites: Writes[T]): JsValue = {
        Json.obj("type" -> tag.runtimeClass.getSimpleName, "event" -> Json.toJson(x))
      }

      implicit val system = ActorSystem()
      val flowUnderTest = controller.wsFlow(MessagingData.namespace)
      val (pub, sub) = TestSource.probe[JsValue]
        .via(flowUnderTest)
        .toMat(TestSink.probe[JsValue])(Keep.both)
        .run()

      sub.request(n = 6)
      sub.expectNextUnordered(mkJs(MessagingData.deviceSeenMessage),
                              mkJs(MessagingData.deviceCreatedMessage),
                              mkJs(MessagingData.deviceDeletedMessage),
                              mkJs(MessagingData.updateSpecMessage),
                              mkJs(MessagingData.packageBlacklistedMessage),
                              mkJs(MessagingData.packageCreatedMessage))
    }
  }

}
