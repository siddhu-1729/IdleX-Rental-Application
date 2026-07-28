import { CATEGORIES } from "@/lib/constants";

export const listings = [
  {
    id: "canon-r6",
    title: "Canon EOS R6 Camera Kit",
    category: "Cameras",
    location: "Bhimavaram",
    price: 1450,
    deposit: 7000,
    rating: 4.9,
    reviews: 42,
    owner: "Aarav Studios",
    image:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=80",
    tags: ["4K video", "2 lenses", "Verified owner"],
    status: "Active",
  },
  {
    id: "trek-bike",
    title: "Trek Hybrid City Bike",
    category: "Sports",
    location: "Vijayawada",
    price: 360,
    deposit: 1800,
    rating: 4.7,
    reviews: 28,
    owner: "Ravi Kumar",
    image:
      "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1200&q=80",
    tags: ["Helmet included", "Daily rental", "Popular"],
    status: "Active",
  },
  {
    id: "bosch-drill",
    title: "Bosch Cordless Drill Set",
    category: "Tools",
    location: "Rajahmundry",
    price: 220,
    deposit: 1200,
    rating: 4.8,
    reviews: 19,
    owner: "Maker Shed",
    image:
      "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=1200&q=80",
    tags: ["Bits included", "Weekend deal", "Inspected"],
    status: "Active",
  },
  {
    id: "projector",
    title: "BenQ Full HD Projector",
    category: "Electronics",
    location: "Eluru",
    price: 900,
    deposit: 4000,
    rating: 4.6,
    reviews: 31,
    owner: "EventBox",
    image:
      "https://images.unsplash.com/photo-1626379953822-baec19c3accd?auto=format&fit=crop&w=1200&q=80",
    tags: ["HDMI", "Speaker", "Same-day pickup"],
    status: "Paused",
  },
];

export const bookings = [
  {
    id: "rent-1042",
    item: "Canon EOS R6 Camera Kit",
    dates: "26 Jul - 29 Jul",
    amount: 4350,
    status: "Confirmed",
    next: "Pickup verification at 10:30 AM",
    extension: {
      available: true,
      currentReturn: "29 Jul, 7:00 PM",
      dailyRate: 1600,
      maxDays: 3,
      approval: "Owner approval required",
      notice: "Request before 12 hours of return time",
    },
  },
  {
    id: "rent-1038",
    item: "Trek Hybrid City Bike",
    dates: "21 Jul - 24 Jul",
    amount: 1080,
    status: "Ongoing",
    next: "Return due today by 7:00 PM",
    extension: {
      available: true,
      currentReturn: "24 Jul, 7:00 PM",
      dailyRate: 420,
      maxDays: 2,
      approval: "Auto approval if no upcoming booking",
      notice: "Request before 6 hours of return time",
    },
  },
  {
    id: "rent-1020",
    item: "Bosch Cordless Drill Set",
    dates: "12 Jul - 13 Jul",
    amount: 440,
    status: "Completed",
    next: "Review the owner",
    extension: {
      available: false,
      currentReturn: "13 Jul, 6:00 PM",
      dailyRate: 260,
      maxDays: 0,
      approval: "Rental completed",
      notice: "Extensions close after return verification",
    },
  },
];

export const conversations = [
  {
    id: "aarav-studios",
    name: "Aarav Studios",
    item: "Canon EOS R6 Camera Kit",
    message: "Pickup slot is confirmed for 10:30 AM.",
    time: "12m ago",
  },
  {
    id: "eventbox",
    name: "EventBox",
    item: "BenQ Full HD Projector",
    message: "The HDMI cable and stand are included.",
    time: "2h ago",
  },
];

export const payments = [
  { id: "pay-881", label: "Camera booking", type: "Rental", amount: 4350, status: "Paid" },
  { id: "pay-842", label: "Security refund", type: "Refund", amount: 1800, status: "Processing" },
  { id: "pay-807", label: "Owner payout", type: "Payout", amount: 6120, status: "Settled" },
];

export const adminRows = [
  { id: "USR-204", name: "Rahul Verma", type: "Renter", status: "Verified", risk: "Low" },
  { id: "LST-918", name: "BenQ Projector", type: "Listing", status: "Review", risk: "Medium" },
  { id: "DSP-031", name: "Late return claim", type: "Dispute", status: "Open", risk: "High" },
  { id: "KYC-115", name: "Maya Iyer", type: "KYC", status: "Pending", risk: "Low" },
];

export const categoryStats = CATEGORIES.map((category, index) => ({
  ...category,
  demand: ["High", "Medium", "High", "Medium", "High", "Low", "Medium", "Low"][index],
}));

export function getListing(id: string) {
  return listings.find((listing) => listing.id === id) ?? listings[0];
}

export function getBooking(id: string) {
  return bookings.find((booking) => booking.id === id) ?? bookings[0];
}
