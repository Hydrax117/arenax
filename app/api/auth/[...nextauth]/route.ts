import { handlers } from "@/auth";

// Expose NextAuth's GET and POST handlers at /api/auth/*
export const { GET, POST } = handlers;
