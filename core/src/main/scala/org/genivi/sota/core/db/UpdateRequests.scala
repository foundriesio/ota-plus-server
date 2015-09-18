/**
 * Copyright: Copyright (C) 2015, Jaguar Land Rover
 * License: MPL-2.0
 */
package org.genivi.sota.core.db

import java.util.UUID
import org.genivi.sota.core.data.Package
import org.joda.time.DateTime
import org.genivi.sota.generic.DeepHLister
import scala.concurrent.ExecutionContext
import slick.driver.MySQLDriver.api._
import org.genivi.sota.core.data.UpdateRequest

object UpdateRequests {

  import org.genivi.sota.refined.SlickRefined._
  import Mappings._
  import SlickExtensions._

  class UpdateRequestsTable(tag: Tag) extends Table[UpdateRequest](tag, "UpdateRequests") {
    def id = column[UUID]("update_request_id", O.PrimaryKey)
    def packageName = column[Package.Name]("package_name")
    def packageVersion = column[Package.Version]("package_version")
    def creationTime = column[DateTime]("creation_time")
    def startAfter = column[DateTime]("start_after")
    def finishBefore = column[DateTime]("finish_before")
    def priority = column[Int]("priority")

    import com.github.nscala_time.time.Imports._
    import shapeless._

    implicit val IntervalGen : Generic[Interval] = new Generic[Interval] {
      type Repr = DateTime :: DateTime :: HNil

      override def to(x : Interval) : Repr = x.start :: x.end :: HNil

      override def from( repr : Repr) : Interval = repr match {
        case start :: end :: HNil => start to end
      }
    }

    def * = (id, packageName, packageVersion, creationTime, startAfter, finishBefore, priority).shaped <>
      (x => UpdateRequest(x._1, Package.Id(x._2, x._3), x._4, x._5 to x._6, x._7 ),
      (x: UpdateRequest) => Some((x.id, x.packageId.name, x.packageId.version, x.creationTime, x.periodOfValidity.start, x.periodOfValidity.end, x.priority )))


  }

  val all = TableQuery[UpdateRequestsTable]

  def list: DBIO[Seq[UpdateRequest]] = all.result

  def persist(request: UpdateRequest)
             (implicit ec: ExecutionContext): DBIO[UpdateRequest] = (all += request).map( _ => request)
}
