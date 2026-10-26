FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /workspace
COPY mvnw pom.xml ./
COPY .mvn .mvn
COPY src src
RUN chmod +x mvnw && ./mvnw -q -DskipTests package

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -S scot && adduser -S scot -G scot
COPY --from=build /workspace/target/*.jar app.jar
USER scot
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
