import { User } from "../models/user.model.js";
import { Project } from "../models/project.model.js";
import mongoose from "mongoose";
// Get User Dashboard Data
// Get User Dashboard Data
export const getDashboardData = async (req, res) => {
  try {
    const _id = req.query; // Assuming user ID is available in req.user
    console.log(_id);

    const user = await User.findById(_id).populate("investments.projectId");

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    let totalShares = 0;
    let totalEnergyProduced = 0;
    let totalCarbonSaved = 0;

    user.investments.forEach((investment) => {
      totalShares += investment.shares;
      const project = investment.projectId;
      if (project) {
        totalEnergyProduced += project.energyPerShare * investment.shares;
        totalCarbonSaved += project.co2PerKwh * totalEnergyProduced;
      }
    });

    // Calculate total trees planted based on total carbon saved
    // Assuming 1 tree absorbs approximately 22 kg of CO2 per year
    const CO2_ABSORPTION_PER_TREE_KG = 22; // 1 tree absorbs about 22 kg of CO2
    const totalTreesPlanted = Math.floor(
      totalCarbonSaved / CO2_ABSORPTION_PER_TREE_KG
    );

    // Send the calculated values directly
    res.status(200).send({
      totalShares,
      totalEnergyProduced,
      totalCarbonSaved,
      totalTreesPlanted, // Include the total trees planted in the response
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ error: "An error occurred while fetching dashboard data." });
  }
};

// Get Monthly Data

export const getMonthlyData = async (req, res) => {
  const userId = req.query._id;

  // Define date ranges for the current month and last month
  const currentMonthStart = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1
  );
  const nextMonthStart = new Date(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    1
  );
  const lastMonthStart = new Date(
    new Date().getFullYear(),
    new Date().getMonth() - 1,
    1
  );

  try {
    // Fetch user investments
    const user = await User.findById(userId).populate("investments.projectId");

    if (!user || !user.investments) {
      return res.status(404).json({ error: "User or investments not found." });
    }

    // Filter investments for the current month
    const currentMonthInvestments = user.investments.filter((investment) => {
      return (
        investment.date >= currentMonthStart && investment.date < nextMonthStart
      );
    });

    // Filter investments for the last month
    const lastMonthInvestments = user.investments.filter((investment) => {
      return (
        investment.date >= lastMonthStart && investment.date < currentMonthStart
      );
    });

    // Helper function to calculate totals
    const calculateTotals = (investments) => {
      return investments.reduce(
        (totals, investment) => {
          const project = investment.projectId;
          const energyProduced = Math.floor(
            project.energyPerShare * investment.shares
          );
          const carbonSaved = project.co2PerKwh * energyProduced;

          totals.totalShares += investment.shares;
          totals.totalEnergyProduced += energyProduced;
          totals.totalCarbonSaved += carbonSaved;

          return totals;
        },
        {
          totalShares: 0,
          totalEnergyProduced: 0,
          totalCarbonSaved: 0,
        }
      );
    };

    // Calculate totals for current and last month
    const currentMonthData = calculateTotals(currentMonthInvestments);
    const lastMonthData = calculateTotals(lastMonthInvestments);

    // Respond with the calculated data
    res.status(200).json({
      currentMonthData,
      lastMonthData,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching monthly data." });
  }
};
// Get Yearly Data
export const getYearlyData = async (req, res) => {
  try {
    const _id = req.query._id;
    const currentYear = new Date().getFullYear();
    const lastYear = currentYear - 1;

    const [currentYearData, lastYearData] = await Promise.all([
      User.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(_id) } },
        { $unwind: "$investments" },
        {
          $lookup: {
            from: "projects",
            localField: "investments.projectId",
            foreignField: "_id",
            as: "projectDetails",
          },
        },
        { $unwind: "$projectDetails" },
        {
          $match: {
            "investments.date": {
              $gte: new Date(currentYear, 0, 1),
              $lt: new Date(currentYear + 1, 0, 1),
            },
          },
        },
        {
          $group: {
            _id: null,
            totalShares: { $sum: "$investments.shares" },
            totalEnergyProduced: {
              $sum: {
                $multiply: [
                  "$projectDetails.energyPerShare",
                  "$investments.shares",
                ],
              },
            },
            totalCarbonSaved: {
              $sum: {
                $multiply: [
                  "$projectDetails.co2PerKwh",
                  {
                    $multiply: [
                      "$projectDetails.energyPerShare",
                      "$investments.shares",
                    ],
                  },
                ],
              },
            },
          },
        },
      ]),
      User.aggregate([
        { $match: { _id: new mongoose.Types.ObjectId(_id) } },
        { $unwind: "$investments" },
        {
          $lookup: {
            from: "projects",
            localField: "investments.projectId",
            foreignField: "_id",
            as: "projectDetails",
          },
        },
        { $unwind: "$projectDetails" },
        {
          $match: {
            "investments.date": {
              $gte: new Date(lastYear, 0, 1),
              $lt: new Date(lastYear + 1, 0, 1),
            },
          },
        },
        {
          $group: {
            _id: null,
            totalShares: { $sum: "$investments.shares" },
            totalEnergyProduced: {
              $sum: {
                $multiply: [
                  "$projectDetails.energyPerShare",
                  "$investments.shares",
                ],
              },
            },
            totalCarbonSaved: {
              $sum: {
                $multiply: [
                  "$projectDetails.co2PerKwh",
                  {
                    $multiply: [
                      "$projectDetails.energyPerShare",
                      "$investments.shares",
                    ],
                  },
                ],
              },
            },
          },
        },
      ]),
    ]);

    res.status(200).send({
      currentYearData: currentYearData[0] || {
        totalShares: 0,
        totalEnergyProduced: 0,
        totalCarbonSaved: 0,
      },
      lastYearData: lastYearData[0] || {
        totalShares: 0,
        totalEnergyProduced: 0,
        totalCarbonSaved: 0,
      },
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ error: "An error occurred while fetching yearly data." });
  }
};

// Get All Recent Transactions
export const getAllRecentTransactions = async (req, res) => {
  try {
    const currentDate = new Date();
    const lastMonthDate = new Date(currentDate);
    lastMonthDate.setMonth(currentDate.getMonth() - 1);

    // Find all users and their investments within the last month
    const users = await User.aggregate([
      { $unwind: "$investments" },
      {
        $match: {
          "investments.date": {
            $gte: lastMonthDate,
            $lte: currentDate,
          },
        },
      },
      {
        $lookup: {
          from: "projects",
          localField: "investments.projectId",
          foreignField: "_id",
          as: "projectDetails",
        },
      },
      { $unwind: "$projectDetails" },
      {
        $project: {
          userId: "$_id",
          userName: "$name",
          email: "$email",
          projectName: "$projectDetails.name",
          shares: "$investments.shares",
          investmentDate: "$investments.date",
          energyProduced: {
            $multiply: [
              "$projectDetails.energyPerShare",
              "$investments.shares",
            ],
          },
          carbonSaved: {
            $multiply: [
              "$projectDetails.co2PerKwh",
              {
                $multiply: [
                  "$projectDetails.energyPerShare",
                  "$investments.shares",
                ],
              },
            ],
          },
        },
      },
      { $sort: { investmentDate: -1 } }, // Sort by date, descending
    ]);

    if (users.length === 0) {
      return res.status(404).json({ message: "No recent transactions found." });
    }

    res.status(200).json({
      message: "Recent transactions retrieved successfully.",
      transactions: users,
    });
  } catch (error) {
    console.error("Error fetching recent transactions:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching recent transactions." });
  }
};
