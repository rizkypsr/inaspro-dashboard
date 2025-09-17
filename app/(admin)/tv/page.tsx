"use client";

import React from "react";
import { Card, CardBody } from "@heroui/card";

import TvCategoriesTab from "../(admin)/fantasy/components/tv-categories-tab";

import { ProtectedRoute } from "@/components/protected-route";

export default function TvPage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            TV Management
          </h1>
          <p className="text-gray-600">
            Manage TV categories and their contents. Create categories and add
            content items directly within each category.
          </p>
        </div>

        <Card>
          <CardBody>
            <div className="py-6">
              <TvCategoriesTab />
            </div>
          </CardBody>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
