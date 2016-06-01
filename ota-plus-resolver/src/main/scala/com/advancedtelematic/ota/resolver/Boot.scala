package com.advancedtelematic.ota.resolver

import akka.actor.ActorSystem
import akka.http.scaladsl.Http
import akka.http.scaladsl.server.{Directives, Route}
import akka.stream.ActorMaterializer
import com.advancedtelematic.ota.common.TraceId
import org.genivi.sota.http.HealthResource
import org.genivi.sota.resolver.filters.FilterDirectives
import org.genivi.sota.resolver.packages.PackageDirectives
import org.genivi.sota.resolver.resolve.ResolveDirectives
import org.genivi.sota.resolver.vehicles.VehicleDirectives
import org.genivi.sota.resolver.components.ComponentDirectives
import org.genivi.sota.rest.Handlers.{exceptionHandler, rejectionHandler}
import org.slf4j.LoggerFactory

import scala.util.Try
import slick.jdbc.JdbcBackend.Database
import org.genivi.sota.http.SotaDirectives._

object Boot extends App with Directives {
  implicit val system = ActorSystem("ota-plus-resolver")
  implicit val materializer = ActorMaterializer()
  implicit val exec = system.dispatcher
  implicit val log = LoggerFactory.getLogger(this.getClass)
  implicit val db = Database.forConfig("database")
  val config = system.settings.config

  import com.advancedtelematic.ota.common.AuthNamespace._

  if (config.getBoolean("database.migrate")) {
    val url = config.getString("database.url")
    val user = config.getString("database.properties.user")
    val password = config.getString("database.properties.password")

    import org.flywaydb.core.Flyway
    val flyway = new Flyway
    flyway.setDataSource(url, user, password)
    flyway.migrate()
  }

  lazy val version = {
    val bi = org.genivi.sota.resolver.BuildInfo
    val otabi = com.advancedtelematic.ota.resolver.BuildInfo
    s"${otabi.name}/${otabi.version} ${bi.name}/${bi.version}"
  }

  val routes: Route =
    (TraceId.withTraceId & logResponseMetrics("ota-plus-resolver", TraceId.traceMetrics) & versionHeaders(version)) {
      (handleRejections(rejectionHandler) & handleExceptions(exceptionHandler)) {
        pathPrefix("api" / "v1") {
          new VehicleDirectives(authNamespace).route ~
            new PackageDirectives(authNamespace).route ~
            new FilterDirectives(authNamespace).route ~
            new ResolveDirectives(authNamespace).route ~
            new ComponentDirectives(authNamespace).route ~
            new PackageFiltersResource().routes
        } ~ new HealthResource(db, com.advancedtelematic.ota.resolver.BuildInfo.toMap).route
      }
    }

  val host = config.getString("server.host")
  val port = config.getInt("server.port")
  val bindingFuture = Http().bindAndHandle(routes, host, port)

  log.info(s"OTA resolver started at http://$host:$port/")

  sys.addShutdownHook {
    Try(db.close())
    Try(system.terminate())
  }
}
