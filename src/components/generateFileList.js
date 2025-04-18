const fs = require("fs");
const path = require("path");

// 👇 ระบุชื่อโฟลเดอร์ที่ต้องการ
const buildingFolders = ["Building_A3_Log", "Building_A6_Log"];

// ฟังก์ชันสร้าง fileList.json
const createFileList = (folderName) => {
  const csvFolderPath = path.join(__dirname, "public", "data", folderName);
  const outputFile = path.join(csvFolderPath, "fileList.json");

  fs.readdir(csvFolderPath, (err, files) => {
    if (err) {
      console.error(`❌ อ่านโฟลเดอร์ ${folderName} ไม่สำเร็จ:`, err);
      return;
    }

    // 📄 เลือกเฉพาะไฟล์ .csv เท่านั้น
    const csvFiles = files.filter((file) => path.extname(file).toLowerCase() === ".csv");

    // ✍️ เขียนไฟล์ JSON
    fs.writeFile(outputFile, JSON.stringify(csvFiles, null, 2), (err) => {
      if (err) {
        console.error(`❌ เขียน ${folderName}/fileList.json ไม่สำเร็จ:`, err);
      } else {
        console.log(`✅ สร้าง ${folderName}/fileList.json สำเร็จแล้ว:`, outputFile);
      }
    });
  });
};

// รันฟังก์ชันสำหรับทั้งสองโฟลเดอร์
buildingFolders.forEach(createFileList);
