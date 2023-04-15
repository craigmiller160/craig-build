plugins {
    java
    id("org.springframework.boot").version("2.6.4")
    id("io.spring.dependency-management").version("1.0.11.RELEASE")
    id("io.craigmiller160.something").version("1.0.0-SNAPSHOT")
}

group = "io.craigmiller160"
version = "1.0.0"

java {
    sourceCompatibility = JavaVersion.VERSION_17
    targetCompatibility = JavaVersion.VERSION_17
}

repositories {
    mavenCentral()
    maven {
        url = uri("https://nexus-craigmiller160.ddns.net/repository/maven-public")
    }
}

dependencies {
    val postgresVersion = "42.2.18"
    val webUtilsVersion = "1.2.0"

    implementation("org.springframework.boot:spring-boot-starter-web")
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    implementation("org.postgresql:postgresql:$postgresVersion")
    implementation("io.craigmiller160:spring-web-utils:$webUtilsVersion")
}

tasks {
    named("test") {
//        useJUnitPlatform()
    }
}