"use client";

import React from "react";

const stats = [
  { title: "Total Rooms", value: 40 },
  { title: "Available", value: 18 },
  { title: "Occupied", value: 16 },
  { title: "Reserved", value: 4 },
  { title: "Maintenance", value: 2 },

];

const categories = [
  { name: "Cliff Cabins", total: 10, occupied: 6, available: 3, maintenance: 1 },
  { name: "Family Cabins", total: 10, occupied: 4, available: 6, maintenance: 0 },
  { name: "Manyattas", total: 10, occupied: 3, available: 7, maintenance: 0 },
  { name: "Tents", total: 10, occupied: 2, available: 8, maintenance: 0 },
];

const rooms = [
  { id: "C01", type: "Cliff", status: "Occupied", guest: "John", checkout: "16 Feb" },
  { id: "C02", type: "Cliff", status: "Available", guest: "-", checkout: "-" },
  { id: "F01", type: "Family", status: "Reserved", guest: "Mary", checkout: "18 Feb" },
  { id: "M01", type: "Manyatta", status: "Occupied", guest: "Alex", checkout: "15 Feb" },
  { id: "T01", type: "Tent", status: "Cleaning", guest: "-", checkout: "-" },
];

const statusColor = (status) => {
  switch (status) {
    case "Available": return "bg-green-100 text-green-700";
    case "Occupied": return "bg-red-100 text-red-700";
    case "Reserved": return "bg-yellow-100 text-yellow-700";
    case "Cleaning": return "bg-blue-100 text-blue-700";
    case "Maintenance": return "bg-gray-200 text-gray-700";
    default: return "bg-gray-100";
  }
};

export default function test1() {
  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <h1 className="text-2xl font-semibold">Accommodation Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="bg-white shadow rounded-lg p-4">
            <p className="text-sm text-gray-500">{s.title}</p>
            <p className="text-xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3 flex-wrap">
        <button className="px-4 py-2 bg-black text-white rounded">+ New Booking</button>
        <button className="px-4 py-2 bg-gray-800 text-white rounded">+ Walk-in</button>
        <button className="px-4 py-2 bg-gray-200 rounded">+ Add Room</button>
        <button className="px-4 py-2 bg-gray-200 rounded">Block Room</button>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {categories.map((c, i) => (
          <div key={i} className="bg-white shadow rounded-lg p-4">
            <h3 className="font-semibold">{c.name}</h3>
            <p>Total: {c.total}</p>
            <p className="text-green-600">Available: {c.available}</p>
            <p className="text-red-600">Occupied: {c.occupied}</p>
            {c.maintenance > 0 && (
              <p className="text-gray-600">Maintenance: {c.maintenance}</p>
            )}
          </div>
        ))}
      </div>

      {/* Rooms Grid */}
      <div className="bg-white shadow rounded-lg p-4">
        <h2 className="font-semibold mb-4">Live Rooms</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {rooms.map((room) => (
            <div key={room.id} className="border rounded-lg p-3">
              <div className="font-semibold">{room.id}</div>
              <div className="text-sm text-gray-500">{room.type}</div>
              <div className={`mt-2 text-sm px-2 py-1 inline-block rounded ${statusColor(room.status)}`}>
                {room.status}
              </div>
              <div className="text-sm mt-2">Guest: {room.guest}</div>
              <div className="text-sm">Check-out: {room.checkout}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}