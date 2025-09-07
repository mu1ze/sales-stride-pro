const router = require("express").Router();
const Client = require("../Models/clientModel");

router.post("/addClient", async (req, res) => {
  try{
    const client = new Client(req.body);
    await client.save();
    res.status(201).json(client);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/getClients/:userId", async (req, res) => {
  try {
    const clients = await Client.find({ userId: req.params.userId });
    res.status(200).json(clients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/clients/:id", async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }
    res.status(200).json(client);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/updateClient/:id", async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }
    res.status(200).json(client);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/clients/:id", async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);
    if (!client) {
      return res.status(404).json({ error: "Client not found" });
    }
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;