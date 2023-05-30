const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "covid19India.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(8000, () => {
      console.log("Server Running at http://localhost:8000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//get states API1
app.get("/states/", async (request, response) => {
  const getStatesQuery = `
    SELECT
    *
    FROM 
    state;`;

  const states = await db.all(getStatesQuery);

  response.send(states);
});

//get single state API2
app.get("/states/:stateId/", async (request, response) => {
  const { state_id } = request.params;

  const getStateQuery = `
    SELECT
    *
    FROM
    state
    WHERE 
    state_id = ${state_id};`;

  const state = await db.get(getStateQuery);

  response.send(state);
});

//create district API3
app.post("/districts/", async (request, response) => {
  const districtDetails = request.body;

  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtDetails;

  const addDistrictQuery = `
    INSERT INTO district
    (district_name,state_id,cases,cured,active,deaths)
    VALUES
    (${districtName},
        ${stateId},
        ${cases},
        ${curved},
        ${active},
        ${deaths});`;

  await db.run(addDistrictQuery);

  response.send("District Successfully Added");
});

//get district API4
app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;

  const getDistrictQuery = `
    SELECT
    *
    FROM
    district
    WHERE
    district_id = ${districtId};`;

  const district = await db.get(getDistrictQuery);

  response.send(district);
});

//delete district API5
app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;

  const deleteDistrictQuery = `
    DELETE FROM
    district
    WHERE 
    district_id = ${districtId};`;

  await db.run(deleteDistrictQuery);

  response.send("District Removed");
});

//update district API6
app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;

  const districtDetails = request.body;

  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtDetails;

  const updateDistrictQuery = `
    UPDATE 
    district
    SET
    district_name = ${districtName},
    state_id = ${stateId},
    cases = ${cases},
    cured = ${cured},
    active = ${active},
    deaths = ${deaths}
    WHERE 
    district_id = ${districtId};`;

  await db.run(updateDistrictQuery);

  response.send("District Details Updated");
});

//get statistics of cases API7
app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;

  const getStatisticsQuery = `
    SELECT
    cases AS totalCases,
    cured AS totalCured,
    active AS totalActive,
    deaths AS totalDeaths
    FROM
    district
    WHERE 
    state_id = ${stateId};`;

  const statistics = await db.get(getStatisticsQuery);

  response.send(statistics);
});

//get district name API8
app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;

  const getDistrictNameQuery = `
    SELECT
    state_name AS stateName
    FROM
    state
    INNER JOIN district
    ON state.state_id = district.state_id
    WHERE 
        district.district_id = ${districtId};`;

  const stateName = await db.get(getDistrictNameQuery);

  response.send(stateName);
});

module.exports = app;
