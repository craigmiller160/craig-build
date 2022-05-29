plugins {
    java
    id("org.springframework.boot").version("2.6.4")
    id("io.spring.dependency-management").version("1.0.11.RELEASE")
}

group = "io.craigmiller160"
version = "1.0.0"

java {
    sourceCompatibility = JavaVersion.VERSION_17
    targetCompatibility = JavaVersion.VERSION_17
}

repositories {
    mavenCentral()
}

val springBootWeb = "2.7.0"

dependencies {
    var springTest = "2.6.8"
    implementation("org.springframework.boot:spring-boot-starter-web:$springBootWeb")
    testImplementation("org.springframework.boot:spring-boot-starter-test:$springTest")
}

tasks {
    named("test") {
//        useJUnitPlatform()
    }
}