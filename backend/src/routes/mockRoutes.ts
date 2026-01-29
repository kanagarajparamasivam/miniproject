import express, { Request, Response } from 'express';

const router = express.Router();

// Mock data as requested
const MOCK_ROUTES = {
    routes: [
        {
            type: "Bus",
            distance: "495 km",
            duration: "9h 30m",
            cost: 650
        },
        {
            type: "Taxi",
            distance: "490 km",
            duration: "8h 45m",
            cost: 6500
        },
        {
            type: "Hybrid",
            distance: "500 km",
            duration: "8h 15m",
            cost: 2200
        }
    ]
};

// POST /api/routes
router.post('/routes', (req: Request, res: Response) => {
    const { fromLocation, toLocation } = req.body;

    console.log(`[Mock API] Route request: ${fromLocation} to ${toLocation}`);

    // Return static mock data regardless of input
    res.json(MOCK_ROUTES);
});

export default router;
