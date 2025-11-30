import { initProducer } from "../../kafka/producer.ts";
import { createService } from "./services/createService.ts";

// Define 12 services
const services = [
  { name: "auth-service" },
  { name: "payment-service", dependency: "auth-service" },
  { name: "inventory-service", dependency: "payment-service" },
  { name: "order-service" },
  { name: "email-service", dependency: "order-service" },
  { name: "notification-service" },
  { name: "search-service" },
  { name: "recommendation-service", dependency: "search-service" },
  { name: "analytics-service" },
  { name: "user-service" },
  { name: "review-service", dependency: "user-service" },
  { name: "gateway-service" }
];

await initProducer()

// Start them
services.forEach((svc) =>
  createService(svc.name, 800 + Math.random() * 600, svc.dependency)
);
