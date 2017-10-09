package com.advancedtelematic

import java.nio.charset.StandardCharsets
import javax.crypto.SecretKey
import javax.crypto.spec.SecretKeySpec

import com.advancedtelematic.jwa.HS256
import com.advancedtelematic.jws.{CompactSerialization, JwsPayload}
import play.api.libs.json.Json

import scala.util.Random

object Tokens {

  def identityTokenFor(subj: String): CompactSerialization = {
    val payload = Json
      .stringify(Json.obj("email" -> "provisioning.spec@advancedtelematic.com", "sub" -> subj))
      .getBytes(StandardCharsets.UTF_8)
    import com.advancedtelematic.json.signature.JcaSupport._

    val HmacKeySize    = 32
    val bytes          = Array.fill[Byte](HmacKeySize)(Random.nextInt().toByte)
    val key: SecretKey = new SecretKeySpec(bytes, "HmacSHA256")
    val keyInfo        = HS256.signingKey(key).right.get
    CompactSerialization(HS256.withKey(JwsPayload(payload), keyInfo))
  }
}
