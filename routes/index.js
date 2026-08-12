const express = require('express');
const router = express.Router();
const { sql, poolPromise } = require('../db');

router.get('/', (req, res) => {
  res.redirect('/dashboard');
});

router.get("/dashboard", async (req, res) => {
  try {
    const pool = await poolPromise;
    const vehicles = await pool.request().
    query("SELECT COUNT(*) AS totalVehicles FROM Vehicles");

    const services = await pool.request()
    .query("SELECT COUNT(*) AS totalServices FROM vehicles");


    const appointments = await pool.request()
    .query("SELECT COUNT(AppointmentDate) AS totalAppointments FROM vehicles");
    const recentvehicles = await pool.request()
    .query("SELECT TOP 5 * FROM Vehicles ORDER BY VehicleID DESC");
res.render("dashboard", {
  totalVehicles: vehicles.recordset[0].totalVehicles,
  totalServices: services.recordset[0].totalServices,
  totalAppointments: appointments.recordset[0].totalAppointments,
  recentVehicles: recentvehicles.recordset
});
  } catch (err) {
    console.log(err);
    res.send(err.message);
  }
});
router.get("/vehicles", async (req, res) => {
  try {
    const pool = await poolPromise;
    const search = req.query.search || '';

    const result = await pool.request()
      .input('search', sql.VarChar, `%${search}%`)
      .query(`
        SELECT * FROM Vehicles
        WHERE OwnerName LIKE @search
           OR PlateNumber LIKE @search
        ORDER BY VehicleID DESC
      `);

    const vehicles = result.recordset;

    res.render("vehicles", {
      vehicles,
      search
    });

  } catch (err) {
    console.log(err);
    res.send(err.message);
  }
});
router.get("/addVehicle", (req, res) => {
  res.render("addVehicle");
});

router.post('/addVehicle', async (req, res) => {
    const { ownerName, vehicleType, plateNumber, serviceType, appointmentDate } = req.body;
    try {
        const pool = await poolPromise;
        const request = pool.request();
        await request
            .input('OwnerName', sql.VarChar, ownerName)
            .input('VehicleType', sql.VarChar, vehicleType)
            .input('PlateNumber', sql.VarChar, plateNumber)
            .input('ServiceType', sql.VarChar, serviceType)
            .input('AppointmentDate', sql.Date, appointmentDate)
            .query(`
                INSERT INTO Vehicles
                (OwnerName, VehicleType, PlateNumber, ServiceType, AppointmentDate)
                VALUES
                (@OwnerName, @VehicleType, @PlateNumber, @ServiceType, @AppointmentDate)
            `);

        res.redirect('/vehicles');

    } catch (err) {
        console.log(err);
        res.send(err.message);
    }
});

router.get('/editVehicle/:id', async (req, res) => {
  try {
    const vehicleId = req.params.id;
    const pool = await poolPromise;
    const result = await pool.request()
      .input('VehicleID', sql.Int, vehicleId)
      .query('SELECT * FROM Vehicles WHERE VehicleID = @VehicleID');
    const vehicle = result.recordset[0];
    res.render('editVehicle', { vehicle });
  } catch (err) {
    console.log(err);
    res.send(err.message);
  }
});

router.post('/editVehicle/:id', async (req, res) => {
  const vehicleId = req.params.id;
  const { ownerName, vehicleType, plateNumber, serviceType, appointmentDate } = req.body;
  try {
    const pool = await poolPromise;
    const request = pool.request();
    await request
      .input('VehicleID', sql.Int, vehicleId)
      .input('OwnerName', sql.VarChar, ownerName)
      .input('VehicleType', sql.VarChar, vehicleType)
      .input('PlateNumber', sql.VarChar, plateNumber)
      .input('ServiceType', sql.VarChar, serviceType)
      .input('AppointmentDate', sql.Date, appointmentDate)
      .query(`
        UPDATE Vehicles
        SET OwnerName = @OwnerName,
            VehicleType = @VehicleType,
            PlateNumber = @PlateNumber,
            ServiceType = @ServiceType,
            AppointmentDate = @AppointmentDate
        WHERE VehicleID = @VehicleID
      `);
    res.redirect('/vehicles');
  } catch (err) {
    console.log(err);
    res.send(err.message);
  }
});

router.get('/deleteVehicle/:id', async (req, res) => {
  try {
    const vehicleId = req.params.id;
    const pool = await poolPromise;
    await pool.request()
      .input('VehicleID', sql.Int, vehicleId)
      .query('DELETE FROM Vehicles WHERE VehicleID = @VehicleID');
      res.redirect('/vehicles');
  } catch (err) {
    console.log(err);
    res.send(err.message);
  }
});
router.get('/profile',(req, res)=> {
  res.render('profile');
});
router.get('/logout',(req, res)=> {
  res.redirect('/');
});
router.get("/services", (req,res) => {
  res.render("services");
});

router.get("/appointments", async (req, res) => {
try {
const pool = await poolPromise;

const result = await pool.request().query(`
 SELECT *
FROM Vehicles
WHERE AppointmentDate IS NOT NULL
ORDER BY AppointmentDate ASC
`);
const appointments = result.recordset;
res.render("appointments", { appointments });
} catch (err) {
console.log(err);
res.send(err.message);
 }
});
router.get('/test-azure', async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request().query(`
      SELECT
        DB_NAME() AS DatabaseName,
        @@SERVERNAME AS ServerName
    `);

    res.json(result.recordset[0]);

  } catch (err) {
    console.log(err);
    res.send(err.message);
  }
});
module.exports = router;
