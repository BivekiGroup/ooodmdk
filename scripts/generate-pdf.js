const fs = require("fs");
const path = require("path");
const markdownpdf = require("markdown-pdf");

const inputFile = path.join(__dirname, "../docs/seo-optimization-report.md");
const outputFile = path.join(__dirname, "../docs/seo-optimization-report.pdf");

const options = {
  remarkable: {
    html: true,
    breaks: true,
    typographer: true,
  },
  cssPath: path.join(__dirname, "pdf-style.css"),
};

markdownpdf(options)
  .from(inputFile)
  .to(outputFile, function () {
    console.log("PDF создан успешно:", outputFile);
  });
