// src/app/about/page.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-6">About XYZ Inventory System</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Providing efficient inventory management solutions to organizations since 2022.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card>
            <CardHeader>
              <CardTitle>Our Mission</CardTitle>
              <CardDescription>What drives us forward</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                Our mission is to simplify inventory management for organizations of all sizes. We strive to create
                intuitive, reliable systems that reduce administrative overhead and improve resource allocation.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Our Vision</CardTitle>
              <CardDescription>Where we're headed</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                We envision a world where organizations can focus on their core mission instead of struggling
                with inventory logistics. Our platform aims to be the most trusted solution for inventory management.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Team Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-10">Our Team</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Jane Smith",
                role: "Founder & CEO",
                bio: "With over 15 years of experience in inventory management systems, Jane leads our vision and strategy."
              },
              {
                name: "John Doe",
                role: "Lead Developer",
                bio: "John has developed inventory solutions for multinational corporations and brings technical expertise to our platform."
              },
              {
                name: "Sarah Johnson",
                role: "UX Designer",
                bio: "Sarah ensures our systems are intuitive and accessible for all users, regardless of technical background."
              }
            ].map((member, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
                  <CardTitle className="text-center">{member.name}</CardTitle>
                  <CardDescription className="text-center">{member.role}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 text-center">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Join hundreds of organizations that have streamlined their inventory management with our system.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/register">
              <Button size="lg">Register Now</Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline">Contact Us</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}