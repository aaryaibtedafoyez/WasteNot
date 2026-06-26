import Donation from "../models/Donation.js";
import User from "../models/User.js";
import { estimateRoute, rankNgosByProximity } from "../utils/routeMock.js";

// Restaurant/caterer posts surplus food.
export async function createDonation(req, res, next) {
  try {
    if (!["restaurant", "admin"].includes(req.user.role)) {
      return res.status(403).json({ message: "Only restaurant accounts can post surplus" });
    }

    const { foodDescription, estimatedServings, category, readyBy, pickupAddress } = req.body;

    if (!foodDescription || !estimatedServings || !readyBy) {
      return res
        .status(400)
        .json({ message: "foodDescription, estimatedServings, and readyBy are required" });
    }

    const donation = await Donation.create({
      donor: req.user._id,
      foodDescription,
      estimatedServings,
      category,
      readyBy,
      pickupAddress: pickupAddress || req.user.address,
      pickupLocation: {
        type: "Point",
        coordinates: req.user.location?.coordinates || [90.4125, 23.8103],
      },
    });

    res.status(201).json({ donation });
  } catch (err) {
    next(err);
  }
}

// Lists available donations, nearest-first to the requesting NGO.
export async function listAvailableDonations(req, res, next) {
  try {
    const donations = await Donation.find({ status: "available" }).populate(
      "donor",
      "name organizationName address"
    );

    const ngoCoords = req.user.location?.coordinates || [90.4125, 23.8103];

    const withRoutes = donations
      .map((donation) => ({
        donation,
        route: estimateRoute(ngoCoords, donation.pickupLocation.coordinates),
      }))
      .sort((a, b) => a.route.distanceKm - b.route.distanceKm);

    res.json({
      count: withRoutes.length,
      results: withRoutes.map(({ donation, route }) => ({ donation, route })),
    });
  } catch (err) {
    next(err);
  }
}

// NGO claims a donation - locks in the route estimate at claim time.
export async function claimDonation(req, res, next) {
  try {
    if (!["ngo", "admin"].includes(req.user.role)) {
      return res.status(403).json({ message: "Only NGO accounts can claim donations" });
    }

    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ message: "Donation not found" });
    if (donation.status !== "available") {
      return res.status(409).json({ message: `Donation already ${donation.status}` });
    }

    const ngoCoords = req.user.location?.coordinates || [90.4125, 23.8103];
    const route = estimateRoute(ngoCoords, donation.pickupLocation.coordinates);

    donation.status = "claimed";
    donation.claimedBy = req.user._id;
    donation.claimedAt = new Date();
    donation.route = route;
    await donation.save();

    res.json({ donation, route });
  } catch (err) {
    next(err);
  }
}

export async function markDelivered(req, res, next) {
  try {
    const donation = await Donation.findOne({ _id: req.params.id, claimedBy: req.user._id });
    if (!donation) return res.status(404).json({ message: "Donation not found or not yours" });

    donation.status = "delivered";
    donation.deliveredAt = new Date();
    await donation.save();

    res.json({ donation });
  } catch (err) {
    next(err);
  }
}

// For a restaurant viewing one of its own donations: which NGOs nearby
// would be good matches, ranked by mock route distance.
export async function suggestNgoMatches(req, res, next) {
  try {
    const donation = await Donation.findOne({ _id: req.params.id, donor: req.user._id });
    if (!donation) return res.status(404).json({ message: "Donation not found" });

    const ngos = await User.find({ role: "ngo" });
    const ranked = rankNgosByProximity(donation.pickupLocation.coordinates, ngos);

    res.json({
      matches: ranked.slice(0, 5).map(({ ngo, route }) => ({
        ngo: { id: ngo._id, name: ngo.organizationName || ngo.name, address: ngo.address },
        route,
      })),
    });
  } catch (err) {
    next(err);
  }
}

export async function myDonations(req, res, next) {
  try {
    const donations = await Donation.find({ donor: req.user._id }).sort({ createdAt: -1 });
    res.json({ donations });
  } catch (err) {
    next(err);
  }
}
