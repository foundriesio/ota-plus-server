package com.advancedtelematic.ota.device

import cats.Show
import eu.timepit.refined._
import eu.timepit.refined.api.{Refined, Validate}
import java.time.Instant
import org.genivi.sota.data.{Device, DeviceT}
import org.genivi.sota.data.Namespace.Namespace
import org.genivi.sota.marshalling.{DeserializationException, RefinementError}
import play.api.libs.functional.syntax._
import play.api.libs.json._


object Devices {

  import Device._

  // Reads
  implicit def refinedReader[T, P](implicit reads: Reads[T], p: Validate.Plain[T, P]): Reads[Refined[T, P]] =
    reads.map { t =>
      refineV[P](t) match {
        case Left(e) =>
          throw new DeserializationException(RefinementError(t, e))
        case Right(r) => r
      }
    }

  implicit def idReads(implicit r: Reads[Refined[String, ValidId]]): Reads[Device.Id] = r.map(r => Device.Id(r))

  implicit val deviceNameReads: Reads[DeviceName] = Reads.StringReads.map(r => DeviceName(r))

  implicit val deviceIdReads: Reads[DeviceId] = Reads.StringReads.map(r => DeviceId(r))

  implicit val DeviceTypeR: Reads[DeviceType.Value] = Reads.enumNameReads(Device.DeviceType)

  implicit val InstantR: Reads[Instant] = Reads[Instant] { js => Reads.DefaultDateReads.reads(js).map(_.toInstant) }

  implicit val DeviceTR: Reads[DeviceT] = Json.reads[DeviceT]

  implicit val DeviceR: Reads[Device] = {(
    (__ \ "namespace").read[Namespace] and
      (__ \ "id").read[Id] and
      (__ \ "deviceName").read[DeviceName] and
      (__ \ "deviceId").readNullable[DeviceId] and
      (__ \ "deviceType").read[DeviceType] and
      (__ \ "lastSeen").readNullable[Instant]
    )(Device.apply _)}


  // Writes

  implicit def refinedWriter[T, P](implicit w: Writes[T]): Writes[Refined[T, P]] = w.contramap(_.get)

  implicit def showWrites[T, P](implicit ev: Show[T]): Writes[T] = Writes.StringWrites.contramap(p => ev.show(p))

  implicit val DeviceTypeW: Writes[DeviceType.Value] = Writes.enumNameWrites[Device.DeviceType.type]

  implicit val InstantW: Writes[Instant] = Writes.StringWrites.contramap(i => i.toString)

  implicit val DeviceTW: Writes[DeviceT] = Json.writes[DeviceT]

  implicit val DeviceW: Writes[Device] = (
    (__ \ "namespace").write[Namespace] and
      (__ \ "id").write[Id] and
      (__ \ "deviceName").write[DeviceName] and
      (__ \ "deviceId").writeNullable[DeviceId] and
      (__ \ "deviceType").write[DeviceType] and
      (__ \ "lastSeen").writeNullable[Instant]
    )(unlift(Device.unapply))
}

