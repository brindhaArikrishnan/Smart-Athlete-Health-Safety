function enterApp() {

    alert("Enter App button is working!");

}
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();


// ======================================================
// BASIC SETUP
// ======================================================

app.use(cors());
app.use(express.json());


// ======================================================
// UPLOAD FOLDER
// ======================================================

const uploadDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, {
        recursive: true
    });
}

const upload = multer({
    dest: uploadDir
});


// ======================================================
// HOME ROUTE
// ======================================================

app.get("/", (req, res) => {

    res.json({
        success: true,
        message: "Smart Athlete Health & Safety Backend is running successfully!"
    });

});


// ======================================================
// HEALTH API
// ======================================================

app.get("/api/health", (req, res) => {

    res.json({
        success: true,
        status: "success",
        message: "Health awareness API is working!"
    });

});


// ======================================================
// ATHLETE HEALTH ASSESSMENT
// ======================================================

app.post("/api/health/assess", (req, res) => {

    const {
        heartRate,
        bodyTemperature,
        ambientTemperature,
        humidity,
        uvIndex,
        exerciseMinutes,
        preExerciseWeight,
        postExerciseWeight,
        fluidIntake,
        urineOutput
    } = req.body;


    // --------------------------------------------------
    // Convert values to numbers
    // --------------------------------------------------

    const hr =
        Number(heartRate) || 0;

    const bodyTemp =
        Number(bodyTemperature) || 0;

    const ambientTemp =
        Number(ambientTemperature) || 0;

    const hum =
        Number(humidity) || 0;

    const uv =
        Number(uvIndex) || 0;

    const exercise =
        Number(exerciseMinutes) || 0;

    const preWeight =
        Number(preExerciseWeight) || 0;

    const postWeight =
        Number(postExerciseWeight) || 0;

    const fluids =
        Number(fluidIntake) || 0;

    const urine =
        Number(urineOutput) || 0;


    // ==================================================
    // DEHYDRATION CALCULATION
    // ==================================================

    let dehydrationPercent = 0;

    if (
        preWeight > 0 &&
        postWeight > 0
    ) {

        dehydrationPercent =
            ((preWeight - postWeight) /
                preWeight) * 100;

        dehydrationPercent =
            Math.max(
                0,
                dehydrationPercent
            );
    }


    // ==================================================
    // SWEAT LOSS CALCULATION
    // ==================================================

    let sweatLossLitres = 0;

    if (
        preWeight > 0 &&
        postWeight > 0
    ) {

        sweatLossLitres =
            (preWeight - postWeight) +
            fluids -
            urine;

        sweatLossLitres =
            Math.max(
                0,
                sweatLossLitres
            );
    }


    const sweatLossPercent =
        preWeight > 0
            ? (sweatLossLitres /
                preWeight) * 100
            : 0;


    // ==================================================
    // SWEAT RATE
    // ==================================================

    const sweatRate =
        exercise > 0
            ? sweatLossLitres /
              (exercise / 60)
            : 0;


    // ==================================================
    // HYDRATION RISK
    // ==================================================

    let hydrationRisk =
        "Low Risk";

    if (
        dehydrationPercent >= 3
    ) {

        hydrationRisk =
            "High Risk";

    } else if (
        dehydrationPercent >= 2
    ) {

        hydrationRisk =
            "Moderate Risk";
    }


    // ==================================================
    // UV RISK
    // ==================================================

    let uvRisk =
        "Low Risk";

    if (uv >= 8) {

        uvRisk =
            "High Risk";

    } else if (uv >= 6) {

        uvRisk =
            "Moderate Risk";
    }


    // ==================================================
    // BODY TEMPERATURE RISK
    // ==================================================

    let temperatureRisk =
        "Low Risk";

    if (bodyTemp >= 39) {

        temperatureRisk =
            "High Risk";

    } else if (bodyTemp >= 38) {

        temperatureRisk =
            "Moderate Risk";
    }


    // ==================================================
    // HEAT STRESS SCORE
    // ==================================================

    let heatScore = 0;


    if (ambientTemp >= 35) {

        heatScore += 50;

    } else if (ambientTemp >= 30) {

        heatScore += 25;
    }


    if (hum >= 80) {

        heatScore += 30;

    } else if (hum >= 70) {

        heatScore += 15;
    }


    if (exercise >= 60) {

        heatScore += 20;

    } else if (exercise >= 30) {

        heatScore += 10;
    }


    if (dehydrationPercent >= 3) {

        heatScore += 30;

    } else if (dehydrationPercent >= 2) {

        heatScore += 15;
    }


    heatScore =
        Math.min(
            100,
            heatScore
        );


    // ==================================================
    // HEAT RISK
    // ==================================================

    let heatRisk =
        "Low Risk";

    if (heatScore >= 70) {

        heatRisk =
            "High Risk";

    } else if (heatScore >= 40) {

        heatRisk =
            "Moderate Risk";
    }


    // ==================================================
    // OVERALL RISK
    // ==================================================

    let overallRisk =
        "Low Risk";


    if (
        hydrationRisk === "High Risk" ||
        uvRisk === "High Risk" ||
        temperatureRisk === "High Risk" ||
        heatRisk === "High Risk"
    ) {

        overallRisk =
            "High Risk";

    } else if (
        hydrationRisk === "Moderate Risk" ||
        uvRisk === "Moderate Risk" ||
        temperatureRisk === "Moderate Risk" ||
        heatRisk === "Moderate Risk"
    ) {

        overallRisk =
            "Moderate Risk";
    }


    // ==================================================
    // RECOMMENDATION
    // ==================================================

    let recommendation =
        "Continue monitoring your health indicators and follow general safety practices.";


    if (
        overallRisk === "High Risk"
    ) {

        recommendation =
            "Consider stopping strenuous activity, moving to a safer environment, and seeking professional medical advice if symptoms are concerning or worsening.";

    } else if (
        overallRisk === "Moderate Risk"
    ) {

        recommendation =
            "Take appropriate rest, maintain hydration, and monitor your symptoms and environmental conditions.";
    }


    // ==================================================
    // RESPONSE
    // ==================================================

    res.json({

        success: true,

        heartRate: hr,

        bodyTemperature: bodyTemp,

        ambientTemperature: ambientTemp,

        humidity: hum,

        uvIndex: uv,

        exerciseMinutes: exercise,

        dehydrationPercent:
            Number(
                dehydrationPercent.toFixed(2)
            ),

        sweatLossLitres:
            Number(
                sweatLossLitres.toFixed(2)
            ),

        sweatLossPercent:
            Number(
                sweatLossPercent.toFixed(2)
            ),

        sweatRate:
            Number(
                sweatRate.toFixed(2)
            ),

        hydrationRisk,

        uvRisk,

        temperatureRisk,

        heatScore,

        heatRisk,

        overallRisk,

        seriousSymptoms: false,

        recommendation,

        screeningOnly: true,

        disclaimer:
            "This prototype provides awareness-oriented screening only and cannot confirm a medical diagnosis."
    });

});


// ======================================================
// UV RISK
// ======================================================

app.post("/api/uv/risk", (req, res) => {

    const uvIndex =
        Number(req.body.uvIndex) || 0;


    let risk =
        "Low Risk";

    let message =
        "General sun protection is recommended.";


    if (uvIndex >= 8) {

        risk =
            "High Risk";

        message =
            "High UV exposure. Consider reducing direct sun exposure and using appropriate sun protection.";

    } else if (uvIndex >= 6) {

        risk =
            "Moderate Risk";

        message =
            "Moderate UV exposure. Use appropriate sun protection during outdoor activity.";
    }


    res.json({

        success: true,

        uvIndex,

        risk,

        message
    });

});


// ======================================================
// AI SKIN SCREENING
// ======================================================

app.post(
    "/api/skin/screen",
    upload.single("skinImage"),
    (req, res) => {

        console.log(
            "Skin image received:",
            req.file
                ? req.file.originalname
                : "No image"
        );


        // ------------------------------------------------
        // Check image
        // ------------------------------------------------

        if (!req.file) {

            return res.status(400).json({

                success: false,

                message:
                    "Please upload an image before screening."
            });
        }


        // ------------------------------------------------
        // Prototype result
        // ------------------------------------------------

        res.json({

            success: true,

            screeningOnly: true,

            finding:
                "Preliminary visual screening completed",

            risk:
                "Needs Review",

            confidence:
                "Not available",

            message:
                "The uploaded image has been received successfully. A trained and validated AI model is required for reliable image-based screening. Please consider professional evaluation for persistent or concerning skin changes.",

            disclaimer:
                "This is an awareness-oriented prototype and cannot confirm a medical diagnosis."
        });

    }
);


// ======================================================
// WORKOUT RECOMMENDATION
// ======================================================

app.post(
    "/api/workout/recommend",
    (req, res) => {

        const temperature =
            Number(req.body.temperature) || 0;

        const humidity =
            Number(req.body.humidity) || 0;

        const uvIndex =
            Number(req.body.uvIndex) || 0;

        const precipitation =
            Number(req.body.precipitation) || 0;


        let rating =
            "GOOD";

        let message =
            "Current conditions are generally suitable for outdoor activity. Follow normal hydration and sun-safety practices.";


        // ------------------------------------------------
        // Rain
        // ------------------------------------------------

        if (precipitation > 70) {

            rating =
                "INDOOR";

            message =
                "High precipitation probability. Consider an indoor workout or wait for safer conditions.";

        }


        // ------------------------------------------------
        // Poor conditions
        // ------------------------------------------------

        else if (
            temperature >= 35 ||
            humidity >= 80 ||
            uvIndex >= 8
        ) {

            rating =
                "POOR";

            message =
                "Environmental conditions may increase safety concerns. Consider postponing intense outdoor exercise or choosing a cooler environment.";

        }


        // ------------------------------------------------
        // Caution
        // ------------------------------------------------

        else if (
            temperature >= 30 ||
            humidity >= 70 ||
            uvIndex >= 6
        ) {

            rating =
                "CAUTION";

            message =
                "Use caution during outdoor activity. Take breaks, maintain hydration, and consider sun protection.";
        }


        res.json({

            success: true,

            rating,

            message,

            screeningOnly: true
        });

    }
);


// ======================================================
// NUTRITION GUIDANCE
// ======================================================

app.post(
    "/api/nutrition/guidance",
    (req, res) => {

        const heatRisk =
            req.body.heatRisk ||
            "Low Risk";

        const exerciseMinutes =
            Number(
                req.body.exerciseMinutes
            ) || 0;


        let title =
            "Standard Training Nutrition Guidance";


        let guidance = [

            "Maintain appropriate hydration throughout the day.",

            "Choose balanced meals containing carbohydrates, protein, fruits and vegetables.",

            "Support recovery with adequate food and rest.",

            "Monitor how you feel during and after exercise."
        ];


        // ------------------------------------------------
        // High heat risk
        // ------------------------------------------------

        if (
            heatRisk === "High Risk" &&
            exerciseMinutes >= 60
        ) {

            title =
                "High Heat-Risk Recovery Guidance";


            guidance = [

                "Prioritize hydration before, during and after exercise.",

                "Take appropriate recovery breaks.",

                "Choose a balanced recovery meal with carbohydrates and protein.",

                "Monitor for concerning symptoms and seek professional advice when appropriate."
            ];
        }


        res.json({

            success: true,

            title,

            guidance,

            screeningOnly: true,

            disclaimer:
                "General educational guidance only; individual nutrition needs may vary."
        });

    }
);


// ======================================================
// ORIGINAL SYMPTOM CHECKER
// ======================================================

app.post(
    "/api/analyze",
    upload.single("skinImage"),
    (req, res) => {

        const itching =
            req.body.itching;

        const pain =
            req.body.pain;

        const days =
            Number(
                req.body.days
            ) || 0;


        let result;


        // ------------------------------------------------
        // Higher screening concern
        // ------------------------------------------------

        if (
            pain === "yes" &&
            days >= 3
        ) {

            result = {

                title:
                    "Preliminary Screening: Needs Review",

                risk:
                    "Needs Review",

                confidence:
                    "Not available",

                recommendation:
                    "The reported symptoms may need further evaluation. Consider professional healthcare advice, especially if symptoms continue or worsen."
            };

        }


        // ------------------------------------------------
        // Itching
        // ------------------------------------------------

        else if (
            itching === "yes"
        ) {

            result = {

                title:
                    "Preliminary Screening: Possible Irritation",

                risk:
                    "Needs Review",

                confidence:
                    "Not available",

                recommendation:
                    "Monitor the affected area and consider professional advice if symptoms continue or worsen."
            };

        }


        // ------------------------------------------------
        // Lower screening concern
        // ------------------------------------------------

        else {

            result = {

                title:
                    "Preliminary Screening Result",

                risk:
                    "Lower Screening Risk",

                confidence:
                    "Not available",

                recommendation:
                    "Continue monitoring and seek professional advice if you have concerns."
            };
        }


        res.json({

            ...result,

            imageUploaded:
                !!req.file,

            screeningOnly:
                true,

            disclaimer:
                "This prototype provides awareness-oriented screening only and cannot confirm a medical diagnosis."
        });

    }
);


// ======================================================
// START SERVER
// ======================================================

const PORT = 5000;


app.listen(
    PORT,
    () => {

        console.log(
            `Server running at http://localhost:${PORT}`
        );

    }
);
/* =========================================================
   SMART ATHLETE SAFETY CENTER
   Additional implementation for:
   - Athlete Safety Score
   - Hydration Risk
   - Heat Risk
   - UV Risk
   - Workout Safety
   - Smart Alerts
   - Assessment History
   - Daily Report
   - Safe Workout Window

   Prototype only — NOT a medical diagnosis.
========================================================= */

(function () {

    /* -------------------------------------------------------
       1. ADD CSS
    ------------------------------------------------------- */

    const style = document.createElement("style");

    style.innerHTML = `
        .smart-safety-section {
            margin: 30px auto;
            max-width: 1100px;
            padding: 25px;
            border-radius: 22px;
            background: linear-gradient(135deg, #073b3a, #0b5d5a);
            color: white;
            box-shadow: 0 12px 35px rgba(0,0,0,0.15);
        }

        .smart-safety-title {
            text-align: center;
            margin-bottom: 25px;
        }

        .smart-safety-title h2 {
            margin: 0;
            font-size: 28px;
        }

        .smart-safety-title p {
            margin-top: 8px;
            opacity: 0.85;
        }

        .safety-input-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
        }

        .safety-input-box {
            background: white;
            padding: 15px;
            border-radius: 15px;
            color: #123;
        }

        .safety-input-box label {
            display: block;
            font-weight: 600;
            margin-bottom: 7px;
        }

        .safety-input-box input {
            width: 100%;
            box-sizing: border-box;
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 9px;
            font-size: 14px;
        }

        .safety-button-row {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
            justify-content: center;
            margin: 20px 0;
        }

        .safety-btn {
            border: none;
            padding: 12px 22px;
            border-radius: 12px;
            cursor: pointer;
            font-weight: bold;
            font-size: 14px;
        }

        .primary-safety-btn {
            background: #20c9b8;
            color: #062f2d;
        }

        .secondary-safety-btn {
            background: white;
            color: #07504d;
        }

        .safety-score-card {
            background: white;
            color: #123;
            border-radius: 20px;
            padding: 25px;
            text-align: center;
            margin-top: 20px;
        }

        .score-number {
            font-size: 58px;
            font-weight: 800;
            margin: 5px;
        }

        .score-label {
            font-weight: bold;
            font-size: 18px;
        }

        .safety-meter {
            height: 16px;
            background: #ddd;
            border-radius: 20px;
            overflow: hidden;
            margin: 15px 0;
        }

        .safety-meter-fill {
            height: 100%;
            width: 0%;
            transition: width 0.7s ease;
        }

        .safety-status {
            display: inline-block;
            padding: 8px 18px;
            border-radius: 30px;
            font-weight: bold;
            margin-top: 8px;
        }

        .status-safe {
            background: #d9f7e8;
            color: #08743d;
        }

        .status-caution {
            background: #fff1c7;
            color: #875d00;
        }

        .status-danger {
            background: #ffdede;
            color: #a40000;
        }

        .safety-card-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
            gap: 15px;
            margin-top: 20px;
        }

        .smart-metric-card {
            background: white;
            color: #123;
            border-radius: 17px;
            padding: 18px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.08);
        }

        .smart-metric-card h3 {
            margin: 0 0 8px;
            font-size: 15px;
        }

        .smart-metric-value {
            font-size: 25px;
            font-weight: 800;
        }

        .smart-recommendation {
            background: rgba(255,255,255,0.12);
            padding: 18px;
            border-radius: 15px;
            margin-top: 20px;
        }

        .smart-alert-box {
            margin-top: 20px;
            background: #fff4d6;
            color: #634700;
            padding: 18px;
            border-radius: 15px;
        }

        .history-box {
            margin-top: 20px;
            background: white;
            color: #123;
            padding: 20px;
            border-radius: 17px;
            overflow-x: auto;
        }

        .history-table {
            width: 100%;
            border-collapse: collapse;
            min-width: 600px;
        }

        .history-table th,
        .history-table td {
            padding: 10px;
            border-bottom: 1px solid #ddd;
            text-align: left;
        }

        .report-box {
            margin-top: 20px;
            background: white;
            color: #123;
            padding: 20px;
            border-radius: 17px;
        }

        .prototype-note {
            margin-top: 20px;
            font-size: 13px;
            opacity: 0.85;
            text-align: center;
        }

        @media(max-width:600px) {
            .smart-safety-section {
                margin: 15px;
                padding: 18px;
            }

            .score-number {
                font-size: 45px;
            }
        }
    `;

    document.head.appendChild(style);


    /* -------------------------------------------------------
       2. CREATE SMART SAFETY UI
    ------------------------------------------------------- */

    function createSmartSafetyCenter() {

        if (document.getElementById("smartSafetyCenter")) {
            return;
        }

        const section = document.createElement("section");

        section.id = "smartSafetyCenter";

        section.className = "smart-safety-section";

        section.innerHTML = `

            <div class="smart-safety-title">

                <h2>🧠 Smart Athlete Safety Center</h2>

                <p>
                    Health + Hydration + Environment + Workout Safety
                </p>

            </div>


            <!-- INPUTS -->

            <div class="safety-input-grid">

                <div class="safety-input-box">
                    <label>💧 Dehydration (%)</label>
                    <input
                        id="saDehydration"
                        type="number"
                        step="0.1"
                        value="2.22"
                        min="0"
                    >
                </div>


                <div class="safety-input-box">
                    <label>❤️ Heart Rate (BPM)</label>
                    <input
                        id="saHeartRate"
                        type="number"
                        value="85"
                        min="30"
                    >
                </div>


                <div class="safety-input-box">
                    <label>🌡️ Temperature (°C)</label>
                    <input
                        id="saTemperature"
                        type="number"
                        value="30"
                    >
                </div>


                <div class="safety-input-box">
                    <label>💦 Humidity (%)</label>
                    <input
                        id="saHumidity"
                        type="number"
                        value="65"
                        min="0"
                        max="100"
                    >
                </div>


                <div class="safety-input-box">
                    <label>☀️ UV Index</label>
                    <input
                        id="saUV"
                        type="number"
                        value="5"
                        step="0.1"
                        min="0"
                    >
                </div>


                <div class="safety-input-box">
                    <label>🏃 Workout Duration (min)</label>
                    <input
                        id="saDuration"
                        type="number"
                        value="60"
                        min="0"
                    >
                </div>

            </div>


            <div class="safety-button-row">

                <button
                    class="safety-btn primary-safety-btn"
                    onclick="runSmartAthleteAssessment()"
                >
                    🧠 Analyze Safety
                </button>


                <button
                    class="safety-btn secondary-safety-btn"
                    onclick="clearSmartAthleteInputs()"
                >
                    Clear
                </button>

            </div>


            <!-- SCORE -->

            <div
                id="smartScoreCard"
                class="safety-score-card"
            >

                <div>ATHLETE SAFETY SCORE</div>

                <div
                    id="smartScore"
                    class="score-number"
                >
                    --
                </div>

                <div
                    id="smartScoreLabel"
                    class="score-label"
                >
                    Enter values and analyze
                </div>

                <div class="safety-meter">

                    <div
                        id="smartScoreMeter"
                        class="safety-meter-fill"
                    ></div>

                </div>

                <div
                    id="smartStatus"
                    class="safety-status"
                >
                    Waiting
                </div>

            </div>


            <!-- METRICS -->

            <div
                id="smartMetricGrid"
                class="safety-card-grid"
            >

                <div class="smart-metric-card">

                    <h3>💧 Hydration</h3>

                    <div
                        id="smartHydration"
                        class="smart-metric-value"
                    >
                        --
                    </div>

                </div>


                <div class="smart-metric-card">

                    <h3>❤️ Heart Rate</h3>

                    <div
                        id="smartHeart"
                        class="smart-metric-value"
                    >
                        --
                    </div>

                </div>


                <div class="smart-metric-card">

                    <h3>🌡️ Heat Risk</h3>

                    <div
                        id="smartHeat"
                        class="smart-metric-value"
                    >
                        --
                    </div>

                </div>


                <div class="smart-metric-card">

                    <h3>☀️ UV Risk</h3>

                    <div
                        id="smartUV"
                        class="smart-metric-value"
                    >
                        --
                    </div>

                </div>


                <div class="smart-metric-card">

                    <h3>🏃 Workout Safety</h3>

                    <div
                        id="smartWorkout"
                        class="smart-metric-value"
                    >
                        --
                    </div>

                </div>

            </div>


            <!-- RECOMMENDATION -->

            <div
                id="smartRecommendation"
                class="smart-recommendation"
            >

                <strong>💡 Recommendation</strong>

                <p>
                    Run the safety analysis to receive guidance.
                </p>

            </div>


            <!-- ALERT -->

            <div
                id="smartAlerts"
                class="smart-alert-box"
            >

                <strong>🔔 Smart Alerts</strong>

                <p>
                    No alerts yet.
                </p>

            </div>


            <!-- SAFE WORKOUT WINDOW -->

            <div
                id="safeWorkoutWindow"
                class="smart-recommendation"
            >

                <strong>⏰ Safe Workout Window</strong>

                <p>
                    Analyze your conditions to receive a suggested workout window.
                </p>

            </div>


            <!-- HISTORY -->

            <div class="history-box">

                <h3>📊 Assessment History</h3>

                <div id="smartHistory">
                    No previous assessments.
                </div>

            </div>


            <!-- REPORT -->

            <div class="report-box">

                <h3>📄 Daily Health Report</h3>

                <div id="dailyReport">
                    No report generated yet.
                </div>

                <div class="safety-button-row">

                    <button
                        class="safety-btn primary-safety-btn"
                        onclick="generateSmartDailyReport()"
                    >
                        Generate Report
                    </button>

                </div>

            </div>


            <div class="prototype-note">

                ⚠️ Awareness prototype only.
                This system does not provide medical diagnosis or treatment.

            </div>

        `;

        /*
          Put the Smart Safety Center near the end of the page.
        */

        const container = document.getElementById("smartSafetyContainer");

if (container) {
    container.appendChild(section);
} else {
    document.body.appendChild(section);
}

        loadSmartAssessmentHistory();

    }


    /* -------------------------------------------------------
       3. SMART ASSESSMENT
    ------------------------------------------------------- */

    window.runSmartAthleteAssessment = function () {

        const dehydration =
            Number(document.getElementById("saDehydration").value) || 0;

        const heartRate =
            Number(document.getElementById("saHeartRate").value) || 0;

        const temperature =
            Number(document.getElementById("saTemperature").value) || 0;

        const humidity =
            Number(document.getElementById("saHumidity").value) || 0;

        const uv =
            Number(document.getElementById("saUV").value) || 0;

        const duration =
            Number(document.getElementById("saDuration").value) || 0;


        /* -----------------------------------------
           HYDRATION RISK
        ----------------------------------------- */

        let hydrationRisk = "Good";

        if (dehydration >= 3) {
            hydrationRisk = "High";
        }
        else if (dehydration >= 2) {
            hydrationRisk = "Moderate";
        }


        /* -----------------------------------------
           HEART RATE AWARENESS
        ----------------------------------------- */

        let heartRisk = "Normal";

        if (heartRate >= 150) {
            heartRisk = "High";
        }
        else if (heartRate >= 120) {
            heartRisk = "Elevated";
        }


        /* -----------------------------------------
           HEAT RISK
        ----------------------------------------- */

        let heatRisk = "Low";

        if (temperature >= 35 && humidity >= 70) {
            heatRisk = "High";
        }
        else if (
            temperature >= 32 ||
            humidity >= 75
        ) {
            heatRisk = "Moderate";
        }


        /* -----------------------------------------
           UV RISK
        ----------------------------------------- */

        let uvRisk = "Low";

        if (uv >= 8) {
            uvRisk = "High";
        }
        else if (uv >= 5) {
            uvRisk = "Moderate";
        }


        /* -----------------------------------------
           WORKOUT SAFETY
        ----------------------------------------- */

        let workoutSafety = "GOOD";

        if (
            heatRisk === "High" ||
            uvRisk === "High" ||
            dehydration >= 3 ||
            heartRate >= 150
        ) {
            workoutSafety = "AVOID";
        }

        else if (
            heatRisk === "Moderate" ||
            uvRisk === "Moderate" ||
            dehydration >= 2 ||
            heartRate >= 120 ||
            duration >= 120
        ) {
            workoutSafety = "CAUTION";
        }


        /* -----------------------------------------
           SAFETY SCORE
           Start from 100 and reduce for risks
        ----------------------------------------- */

        let score = 100;


        if (dehydration >= 2) {
            score -= 15;
        }

        if (dehydration >= 3) {
            score -= 15;
        }


        if (heartRate >= 120) {
            score -= 10;
        }

        if (heartRate >= 150) {
            score -= 15;
        }


        if (heatRisk === "Moderate") {
            score -= 15;
        }

        if (heatRisk === "High") {
            score -= 25;
        }


        if (uvRisk === "Moderate") {
            score -= 10;
        }

        if (uvRisk === "High") {
            score -= 20;
        }


        if (duration >= 120) {
            score -= 10;
        }


        score = Math.max(0, Math.min(100, score));


        /* -----------------------------------------
           OVERALL STATUS
        ----------------------------------------- */

        let overallStatus = "SAFE";

        if (score < 50) {
            overallStatus = "HIGH RISK";
        }
        else if (score < 75) {
            overallStatus = "MODERATE RISK";
        }


        /* -----------------------------------------
           RECOMMENDATION
        ----------------------------------------- */

        let recommendations = [];


        if (dehydration >= 2) {
            recommendations.push(
                "Maintain hydration and consider a recovery break."
            );
        }


        if (heatRisk === "Moderate") {
            recommendations.push(
                "Consider reducing workout intensity in warm conditions."
            );
        }


        if (heatRisk === "High") {
            recommendations.push(
                "Avoid intense outdoor activity during high heat conditions."
            );
        }


        if (uvRisk === "Moderate") {
            recommendations.push(
                "Use sun protection and take regular breaks."
            );
        }


        if (uvRisk === "High") {
            recommendations.push(
                "Avoid peak UV exposure and consider a safer workout time."
            );
        }


        if (heartRate >= 120) {
            recommendations.push(
                "Monitor heart rate and allow adequate recovery."
            );
        }


        if (workoutSafety === "GOOD") {
            recommendations.push(
                "Current inputs indicate generally favorable workout conditions."
            );
        }


        if (recommendations.length === 0) {
            recommendations.push(
                "Maintain normal hydration and monitor your condition."
            );
        }


        const recommendationText =
            recommendations.join(" ");


        /* -----------------------------------------
           UPDATE UI
        ----------------------------------------- */

        document.getElementById("smartScore").innerText =
            score + "/100";


        document.getElementById("smartScoreLabel").innerText =
            overallStatus;


        const meter =
            document.getElementById("smartScoreMeter");

        meter.style.width = score + "%";


        const status =
            document.getElementById("smartStatus");

        status.innerText = overallStatus;


        status.className = "safety-status";


        if (score >= 75) {
            status.classList.add("status-safe");
        }

        else if (score >= 50) {
            status.classList.add("status-caution");
        }

        else {
            status.classList.add("status-danger");
        }


        document.getElementById("smartHydration").innerText =
            hydrationRisk;


        document.getElementById("smartHeart").innerText =
            heartRisk;


        document.getElementById("smartHeat").innerText =
            heatRisk;


        document.getElementById("smartUV").innerText =
            uvRisk;


        document.getElementById("smartWorkout").innerText =
            workoutSafety;


        document.getElementById("smartRecommendation").innerHTML = `

            <strong>💡 Smart Recommendation</strong>

            <p>${recommendationText}</p>

        `;


        /* -----------------------------------------
           SMART ALERTS
        ----------------------------------------- */

        const alerts = [];


        if (dehydration >= 2) {
            alerts.push(
                "💧 Hydration attention required."
            );
        }


        if (heatRisk === "Moderate") {
            alerts.push(
                "🌡️ Moderate heat conditions detected."
            );
        }


        if (heatRisk === "High") {
            alerts.push(
                "🚨 High heat conditions detected."
            );
        }


        if (uvRisk === "Moderate") {
            alerts.push(
                "☀️ Moderate UV exposure."
            );
        }


        if (uvRisk === "High") {
            alerts.push(
                "☀️ High UV exposure detected."
            );
        }


        if (heartRate >= 120) {
            alerts.push(
                "❤️ Elevated heart rate — monitor recovery."
            );
        }


        if (workoutSafety === "AVOID") {
            alerts.push(
                "🛑 Workout conditions require caution/avoidance."
            );
        }


        if (alerts.length === 0) {

            document.getElementById("smartAlerts").innerHTML = `

                <strong>🔔 Smart Alerts</strong>

                <p>✅ No major safety alerts from the entered prototype inputs.</p>

            `;

        }

        else {

            document.getElementById("smartAlerts").innerHTML = `

                <strong>🔔 Smart Alerts</strong>

                ${alerts.map(function (alert) {

                    return `<p>• ${alert}</p>`;

                }).join("")}

            `;

        }


        /* -----------------------------------------
           SAFE WORKOUT WINDOW
        ----------------------------------------- */

        let workoutWindow = "";


        if (uvRisk === "High" || heatRisk === "High") {

            workoutWindow =
                "⏰ Prefer an early-morning or cooler workout period and avoid peak outdoor heat/UV.";

        }

        else if (
            uvRisk === "Moderate" ||
            heatRisk === "Moderate"
        ) {

            workoutWindow =
                "⏰ Consider an early morning or evening workout and take regular hydration breaks.";

        }

        else {

            workoutWindow =
                "⏰ Current prototype inputs indicate generally favorable conditions. Continue normal safety awareness.";

        }


        document.getElementById("safeWorkoutWindow").innerHTML = `

            <strong>⏰ Safe Workout Window</strong>

            <p>${workoutWindow}</p>

        `;


        /* -----------------------------------------
           SAVE HISTORY
        ----------------------------------------- */

        const assessment = {

            date:
                new Date().toLocaleString(),

            dehydration:
                dehydration,

            heartRate:
                heartRate,

            temperature:
                temperature,

            humidity:
                humidity,

            uv:
                uv,

            duration:
                duration,

            score:
                score,

            status:
                overallStatus,

            workout:
                workoutSafety

        };


        let history =
            JSON.parse(
                localStorage.getItem(
                    "smartAthleteHistory"
                )
            ) || [];


        history.unshift(assessment);


        /*
          Keep last 10 assessments
        */

        history =
            history.slice(0, 10);


        localStorage.setItem(
            "smartAthleteHistory",
            JSON.stringify(history)
        );


        loadSmartAssessmentHistory();


        /*
          Save latest assessment separately
        */

        localStorage.setItem(
            "latestSmartAssessment",
            JSON.stringify(assessment)
        );


        /*
          Scroll result into view
        */

        document
            .getElementById("smartScoreCard")
            .scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

    };


    /* -------------------------------------------------------
       4. HISTORY
    ------------------------------------------------------- */

    window.loadSmartAssessmentHistory = function () {

        const historyContainer =
            document.getElementById(
                "smartHistory"
            );


        if (!historyContainer) {
            return;
        }


        const history =
            JSON.parse(
                localStorage.getItem(
                    "smartAthleteHistory"
                )
            ) || [];


        if (history.length === 0) {

            historyContainer.innerHTML =
                "No previous assessments.";

            return;
        }


        let html = `

            <table class="history-table">

                <thead>

                    <tr>

                        <th>Date</th>
                        <th>Dehydration</th>
                        <th>Score</th>
                        <th>Risk</th>
                        <th>Workout</th>

                    </tr>

                </thead>

                <tbody>

        `;


        history.forEach(function (item) {

            html += `

                <tr>

                    <td>${item.date}</td>

                    <td>${item.dehydration}%</td>

                    <td>${item.score}/100</td>

                    <td>${item.status}</td>

                    <td>${item.workout}</td>

                </tr>

            `;

        });


        html += `

                </tbody>

            </table>

        `;


        historyContainer.innerHTML = html;

    };


    /* -------------------------------------------------------
       5. DAILY REPORT
    ------------------------------------------------------- */

    window.generateSmartDailyReport = function () {

        const latest =
            JSON.parse(
                localStorage.getItem(
                    "latestSmartAssessment"
                )
            );


        const report =
            document.getElementById(
                "dailyReport"
            );


        if (!report) {
            return;
        }


        if (!latest) {

            report.innerHTML = `

                <p>
                    Please run a Smart Athlete Assessment first.
                </p>

            `;

            return;
        }


        report.innerHTML = `

            <h4>Smart Athlete Daily Safety Report</h4>

            <p>
                <strong>Date:</strong>
                ${latest.date}
            </p>

            <p>
                <strong>Athlete Safety Score:</strong>
                ${latest.score}/100
            </p>

            <p>
                <strong>Overall Status:</strong>
                ${latest.status}
            </p>

            <p>
                <strong>Dehydration:</strong>
                ${latest.dehydration}%
            </p>

            <p>
                <strong>Heart Rate:</strong>
                ${latest.heartRate} BPM
            </p>

            <p>
                <strong>Temperature:</strong>
                ${latest.temperature}°C
            </p>

            <p>
                <strong>Humidity:</strong>
                ${latest.humidity}%
            </p>

            <p>
                <strong>UV Index:</strong>
                ${latest.uv}
            </p>

            <p>
                <strong>Workout Safety:</strong>
                ${latest.workout}
            </p>

            <hr>

            <p>
                This report is generated for awareness
                and safety-support purposes only.
                It is not a medical diagnosis.
            </p>

        `;

    };


    /* -------------------------------------------------------
       6. CLEAR INPUTS
    ------------------------------------------------------- */

    window.clearSmartAthleteInputs = function () {

        document.getElementById("saDehydration").value = "";
        document.getElementById("saHeartRate").value = "";
        document.getElementById("saTemperature").value = "";
        document.getElementById("saHumidity").value = "";
        document.getElementById("saUV").value = "";
        document.getElementById("saDuration").value = "";

        document.getElementById("smartScore").innerText = "--";

        document.getElementById("smartScoreLabel").innerText =
            "Enter values and analyze";

        document.getElementById("smartScoreMeter").style.width =
            "0%";

        document.getElementById("smartStatus").innerText =
            "Waiting";

        document.getElementById("smartHydration").innerText =
            "--";

        document.getElementById("smartHeart").innerText =
            "--";

        document.getElementById("smartHeat").innerText =
            "--";

        document.getElementById("smartUV").innerText =
            "--";

        document.getElementById("smartWorkout").innerText =
            "--";

        document.getElementById("smartRecommendation").innerHTML = `

            <strong>💡 Recommendation</strong>

            <p>
                Run the safety analysis to receive guidance.
            </p>

        `;

    };


    /* -------------------------------------------------------
       7. START
    ------------------------------------------------------- */

    function startSmartSafetyCenter() {

        /*
          Wait until page is ready.
        */

        if (document.readyState === "loading") {

            document.addEventListener(
                "DOMContentLoaded",
                createSmartSafetyCenter
            );

        }

        else {

            createSmartSafetyCenter();

        }

    }


    startSmartSafetyCenter();

})();