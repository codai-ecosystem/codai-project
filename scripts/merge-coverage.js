#!/usr/bin/env node

/**
 * Coverage Merger for CODAI Ecosystem
 * Combines coverage reports from all packages and apps
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

class CoverageMerger {
    constructor() {
        this.rootDir = path.join(__dirname, '..');
        this.outputDir = path.join(this.rootDir, 'coverage');
        this.mergedCoverage = {
            total: {
                lines: { total: 0, covered: 0, skipped: 0, pct: 0 },
                functions: { total: 0, covered: 0, skipped: 0, pct: 0 },
                statements: { total: 0, covered: 0, skipped: 0, pct: 0 },
                branches: { total: 0, covered: 0, skipped: 0, pct: 0 }
            },
            files: {}
        };
    }

    log(message) {
        console.log(`[Coverage] ${message}`);
    }

    findCoverageFiles() {
        const patterns = [
            'apps/*/coverage/coverage-final.json',
            'packages/*/coverage/coverage-final.json',
            'coverage/coverage-final.json'
        ];

        let coverageFiles = [];

        patterns.forEach(pattern => {
            const files = glob.sync(pattern, { cwd: this.rootDir });
            coverageFiles = coverageFiles.concat(files.map(f => path.join(this.rootDir, f)));
        });

        return coverageFiles;
    }

    mergeCoverageData(coverageFiles) {
        this.log(`Merging ${coverageFiles.length} coverage files...`);

        const allFilesCoverage = {};
        const summary = {
            lines: { total: 0, covered: 0 },
            functions: { total: 0, covered: 0 },
            statements: { total: 0, covered: 0 },
            branches: { total: 0, covered: 0 }
        };

        coverageFiles.forEach(file => {
            if (!fs.existsSync(file)) {
                this.log(`Warning: Coverage file not found: ${file}`);
                return;
            }

            try {
                const coverage = JSON.parse(fs.readFileSync(file, 'utf8'));

                Object.keys(coverage).forEach(filePath => {
                    const fileCoverage = coverage[filePath];

                    // Normalize file path
                    const normalizedPath = path.relative(this.rootDir, filePath);

                    // Merge file coverage data
                    allFilesCoverage[normalizedPath] = fileCoverage;

                    // Update summary
                    if (fileCoverage.s) {
                        Object.values(fileCoverage.s).forEach(hits => {
                            summary.statements.total++;
                            if (hits > 0) summary.statements.covered++;
                        });
                    }

                    if (fileCoverage.f) {
                        Object.values(fileCoverage.f).forEach(hits => {
                            summary.functions.total++;
                            if (hits > 0) summary.functions.covered++;
                        });
                    }

                    if (fileCoverage.b) {
                        Object.values(fileCoverage.b).forEach(branches => {
                            branches.forEach(hits => {
                                summary.branches.total++;
                                if (hits > 0) summary.branches.covered++;
                            });
                        });
                    }
                });

                this.log(`✅ Processed: ${path.relative(this.rootDir, file)}`);
            } catch (error) {
                this.log(`❌ Failed to process ${file}: ${error.message}`);
            }
        });

        // Calculate percentages
        Object.keys(summary).forEach(type => {
            const data = summary[type];
            data.pct = data.total > 0 ? ((data.covered / data.total) * 100) : 100;
        });

        return { allFilesCoverage, summary };
    }

    generateReports(allFilesCoverage, summary) {
        // Ensure output directory exists
        fs.mkdirSync(this.outputDir, { recursive: true });

        // Write merged coverage data
        const mergedFile = path.join(this.outputDir, 'coverage-final.json');
        fs.writeFileSync(mergedFile, JSON.stringify(allFilesCoverage, null, 2));

        // Generate summary report
        const summaryFile = path.join(this.outputDir, 'coverage-summary.json');
        fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));

        // Generate HTML report
        this.generateHtmlReport(summary);

        // Generate console report
        this.generateConsoleReport(summary);

        this.log(`✅ Reports generated in: ${this.outputDir}`);
    }

    generateHtmlReport(summary) {
        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CODAI Coverage Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 5px; }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .metric { background: white; border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
        .metric h3 { margin: 0 0 10px 0; }
        .percentage { font-size: 2em; font-weight: bold; }
        .good { color: #28a745; }
        .warning { color: #ffc107; }
        .danger { color: #dc3545; }
        .details { margin: 10px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>CODAI Ecosystem Coverage Report</h1>
        <p>Generated: ${new Date().toLocaleString()}</p>
    </div>
    
    <div class="metrics">
        ${Object.entries(summary).map(([type, data]) => `
            <div class="metric">
                <h3>${type.charAt(0).toUpperCase() + type.slice(1)}</h3>
                <div class="percentage ${this.getColorClass(data.pct)}">${data.pct.toFixed(1)}%</div>
                <div class="details">
                    ${data.covered}/${data.total} covered
                </div>
            </div>
        `).join('')}
    </div>
    
    <div class="summary">
        <h2>Coverage Thresholds</h2>
        <ul>
            <li>Lines: ${summary.lines.pct >= 80 ? '✅' : '❌'} ${summary.lines.pct.toFixed(1)}% (Target: 80%)</li>
            <li>Functions: ${summary.functions.pct >= 80 ? '✅' : '❌'} ${summary.functions.pct.toFixed(1)}% (Target: 80%)</li>
            <li>Statements: ${summary.statements.pct >= 80 ? '✅' : '❌'} ${summary.statements.pct.toFixed(1)}% (Target: 80%)</li>
            <li>Branches: ${summary.branches.pct >= 70 ? '✅' : '❌'} ${summary.branches.pct.toFixed(1)}% (Target: 70%)</li>
        </ul>
    </div>
</body>
</html>`;

        const htmlFile = path.join(this.outputDir, 'index.html');
        fs.writeFileSync(htmlFile, html);
    }

    generateConsoleReport(summary) {
        console.log('\n📊 CODAI Coverage Summary');
        console.log('========================');

        Object.entries(summary).forEach(([type, data]) => {
            const status = this.getStatus(type, data.pct);
            const color = this.getConsoleColor(data.pct);
            console.log(`${status} ${type.padEnd(12)}: ${color}${data.pct.toFixed(1)}%\x1b[0m (${data.covered}/${data.total})`);
        });

        console.log('\n🎯 Threshold Analysis:');
        console.log(`Lines:      ${summary.lines.pct >= 80 ? '✅ PASS' : '❌ FAIL'} (${summary.lines.pct.toFixed(1)}% >= 80%)`);
        console.log(`Functions:  ${summary.functions.pct >= 80 ? '✅ PASS' : '❌ FAIL'} (${summary.functions.pct.toFixed(1)}% >= 80%)`);
        console.log(`Statements: ${summary.statements.pct >= 80 ? '✅ PASS' : '❌ FAIL'} (${summary.statements.pct.toFixed(1)}% >= 80%)`);
        console.log(`Branches:   ${summary.branches.pct >= 70 ? '✅ PASS' : '❌ FAIL'} (${summary.branches.pct.toFixed(1)}% >= 70%)`);

        const overallPass = summary.lines.pct >= 80 && summary.functions.pct >= 80 &&
            summary.statements.pct >= 80 && summary.branches.pct >= 70;

        console.log(`\n${overallPass ? '🎉 OVERALL: PASS' : '🚨 OVERALL: FAIL'}`);
    }

    getColorClass(percentage) {
        if (percentage >= 80) return 'good';
        if (percentage >= 70) return 'warning';
        return 'danger';
    }

    getStatus(type, percentage) {
        const threshold = type === 'branches' ? 70 : 80;
        return percentage >= threshold ? '✅' : '❌';
    }

    getConsoleColor(percentage) {
        if (percentage >= 80) return '\x1b[32m'; // Green
        if (percentage >= 70) return '\x1b[33m'; // Yellow
        return '\x1b[31m'; // Red
    }

    async merge() {
        try {
            this.log('Starting coverage merge process...');

            const coverageFiles = this.findCoverageFiles();

            if (coverageFiles.length === 0) {
                this.log('❌ No coverage files found');
                process.exit(1);
            }

            const { allFilesCoverage, summary } = this.mergeCoverageData(coverageFiles);
            this.generateReports(allFilesCoverage, summary);

            // Exit with error if coverage thresholds not met
            const overallPass = summary.lines.pct >= 80 && summary.functions.pct >= 80 &&
                summary.statements.pct >= 80 && summary.branches.pct >= 70;

            if (!overallPass) {
                this.log('❌ Coverage thresholds not met');
                process.exit(1);
            }

            this.log('✅ Coverage merge completed successfully');

        } catch (error) {
            this.log(`❌ Coverage merge failed: ${error.message}`);
            process.exit(1);
        }
    }
}

// Run merger if called directly
if (require.main === module) {
    const merger = new CoverageMerger();
    merger.merge();
}

module.exports = CoverageMerger;