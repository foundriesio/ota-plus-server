package com.advancedtelematic.api

import play.api.Configuration

case class OtaApiUri(serviceName: String, uri: String)

trait OtaPlusConfig {
  val conf: Configuration

  val coreApiUri = OtaApiUri("core", conf.underlying.getString("core.uri"))

  val resolverApiUri = OtaApiUri("resolver", conf.underlying.getString("resolver.uri"))

  val devicesApiUri = OtaApiUri("device-registry", conf.underlying.getString("deviceregistry.uri"))

  val authPlusApiUri = OtaApiUri("auth-plus", conf.underlying.getString("authplus.uri"))

  val userProfileApiUri = OtaApiUri("user-profile", conf.underlying.getString("userprofile.uri"))

  val auditorApiUri = OtaApiUri("auditor", conf.underlying.getString("auditor.uri"))

  val directorApiUri = OtaApiUri("director", conf.underlying.getString("director.uri"))

  val repoApiUri = OtaApiUri("reposerver-internal", conf.underlying.getString("repo.uri"))

  val repoPubApiUri = OtaApiUri("reposerver", conf.underlying.getString("repo.pub.uri"))

  val campaignerApiUri = OtaApiUri("campaigner", conf.underlying.getString("campaigner.uri"))

  val keyServerApiUri = OtaApiUri("keyserver", conf.underlying.getString("keyserver.uri"))

  val treehubPubApiUri = OtaApiUri("trehub", conf.underlying.getString("treehub.pub.uri"))

  val apiGatewayUri = OtaApiUri("api-gateway", conf.underlying.getString("api_gateway.uri"))
}
