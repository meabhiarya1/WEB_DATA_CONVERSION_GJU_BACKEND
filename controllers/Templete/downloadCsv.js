const Files = require("../../models/TempleteModel/files");
const path = require("path");
const fs = require("fs").promises; // Use the promises API for async/await
const csvToJson = require("../../services/csv_to_json");
const jsonToCsv = require("../../services/json_to_csv");

const downloadCsv = async (req, res) => {
  try {
    const fileId = req.params.id;
    if (!fileId) {
      return res.status(400).json({ error: "File ID not provided" });
    }

    const fileData = await Files.findOne({
      where: { id: fileId },
    });

    if (!fileData) {
      return res.status(404).json({ error: "File not found" });
    }

    const originalFilename = fileData.csvFile;
    const originalFilePath = path.join(__dirname, "../../csvFile", originalFilename);

    try {
      await fs.access(originalFilePath); // Check if the file exists
    } catch (err) {
      return res.status(404).json({ error: "File not found" });
    }

    const jsonData = await csvToJson(originalFilePath);

    // Remove the first row (optional)
    jsonData.shift();

    // Convert JSON data back to CSV
    const csvData = jsonToCsv(jsonData);

    // Create a temporary file
    console.log()
    const tempFilePath = path.join(__dirname, "../../csvFile", `temp_${originalFilename}`);
    await fs.writeFile(tempFilePath, csvData, { encoding: "utf8" });

    // Set headers to include the original filename
    console.log(originalFilename + " ")
    res.setHeader("Content-Disposition", `attachment; filename="${originalFilename}"`);
    res.setHeader("Content-Type", "text/csv");

    // Send the file to the client for download
    res.download(tempFilePath, async (err) => {
      if (err) {
        console.error("Error sending file:", err);
        return res
          .status(500)
          .json({ error: "An error occurred while processing your request" });
      }

      // Delete the temporary file after sending it to the client
      try {
        await fs.unlink(tempFilePath);
      } catch (unlinkErr) {
        console.error("Error deleting temporary file:", unlinkErr);
      }
    });
  } catch (error) {
    console.error("Error downloading CSV file:", error);
    res.status(500).json({ error: "An error occurred while processing your request" });
  }
};

module.exports = downloadCsv;
