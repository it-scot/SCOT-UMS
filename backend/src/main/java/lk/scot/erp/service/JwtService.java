package lk.scot.erp.service;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;

import lk.scot.erp.config.AppProperties;
import lk.scot.erp.entity.UserAccount;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class JwtService {

	private final AppProperties appProperties;

	public String issueToken(UserAccount user) {
		Instant now = Instant.now();
		JWTClaimsSet claims = new JWTClaimsSet.Builder()
				.issuer(appProperties.getJwt().getIssuer())
				.subject(user.getId().toString())
				.claim("email", user.getEmail())
				.claim("role", user.getRole().name())
				.issueTime(Date.from(now))
				.expirationTime(Date.from(now.plusMillis(appProperties.getJwt().getExpirationMs())))
				.build();

		try {
			SignedJWT jwt = new SignedJWT(new JWSHeader(JWSAlgorithm.HS256), claims);
			jwt.sign(new MACSigner(secretBytes()));
			return jwt.serialize();
		} catch (JOSEException ex) {
			throw new IllegalStateException("Failed to sign campus JWT", ex);
		}
	}

	public JWTClaimsSet parseAndVerify(String token) {
		try {
			SignedJWT jwt = SignedJWT.parse(token);
			if (!jwt.verify(new MACVerifier(secretBytes()))) {
				throw new IllegalArgumentException("Invalid campus JWT signature");
			}
			JWTClaimsSet claims = jwt.getJWTClaimsSet();
			Date expiration = claims.getExpirationTime();
			if (expiration == null || expiration.toInstant().isBefore(Instant.now())) {
				throw new IllegalArgumentException("Campus JWT has expired");
			}
			return claims;
		} catch (IllegalArgumentException ex) {
			throw ex;
		} catch (Exception ex) {
			throw new IllegalArgumentException("Invalid campus JWT", ex);
		}
	}

	public UUID subjectAsUuid(JWTClaimsSet claims) {
		return UUID.fromString(claims.getSubject());
	}

	private byte[] secretBytes() {
		byte[] secret = appProperties.getJwt().getSecret().getBytes(StandardCharsets.UTF_8);
		if (secret.length < 32) {
			throw new IllegalStateException("app.jwt.secret must be at least 32 bytes for HS256");
		}
		return secret;
	}
}
