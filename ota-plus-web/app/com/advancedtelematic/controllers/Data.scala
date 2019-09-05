package com.advancedtelematic.controllers

import java.time.Instant

import play.api.libs.functional.syntax._
import play.api.libs.json._

import scala.collection.Seq

object Data {

  final case class FeedResource(createdAt: Instant, _type: String, resource: JsValue)
  object FeedResource {
    def of(_type: String)(createdAt: Instant, resource: JsValue): FeedResource = {
      FeedResource(createdAt, _type, resource)
    }
  }

  implicit val feedResourceWrites: Writes[FeedResource] = Json.writes[FeedResource]

  def feedResourceReads(_type: String): Reads[FeedResource] = (
    (__ \ "createdAt").read[Instant] and
    __.read[JsValue]
  )(FeedResource.of(_type) _)

  def feedResourcesReads(_type: String): Reads[Seq[FeedResource]] = {
    implicit val rr = feedResourceReads(_type)
    Reads.traversableReads[Seq, FeedResource]
  }

}
