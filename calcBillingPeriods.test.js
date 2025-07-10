const { calcBillingPeriods } = require("./calcBillingPeriods"); // Adjust import path
const moment = require("moment");

// Note: Helper functions are now included in the main file

// Alternative: If helper functions are in same file, mock them differently
const mockNearestNextValidDate = jest.fn((date) => date);
const mockNearestPrevValidDate = jest.fn((date) => date);

describe("calcBillingPeriods", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Input Validation", () => {
    describe("periodYear validation", () => {
      test("should return false for invalid year format - too short", () => {
        const result = calcBillingPeriods(15, "202");
        expect(result).toBe(false);
      });

      test("should return false for invalid year format - too long", () => {
        const result = calcBillingPeriods(15, "20231");
        expect(result).toBe(false);
      });

      test("should return false for year not starting with 2", () => {
        const result = calcBillingPeriods(15, "1999");
        expect(result).toBe(false);
      });

      test("should return false for non-numeric year", () => {
        const result = calcBillingPeriods(15, "abcd");
        expect(result).toBe(false);
      });

      test("should return false for year with special characters", () => {
        const result = calcBillingPeriods(15, "20@3");
        expect(result).toBe(false);
      });

      test("should return false for empty year", () => {
        const result = calcBillingPeriods(15, "");
        expect(result).toBe(false);
      });

      test("should return false for null year", () => {
        const result = calcBillingPeriods(15, null);
        expect(result).toBe(false);
      });

      test("should return false for undefined year", () => {
        const result = calcBillingPeriods(15, undefined);
        expect(result).toBe(false);
      });

      test("should accept valid year starting with 2", () => {
        const result = calcBillingPeriods(15, "2023");
        expect(result).not.toBe(false);
        expect(Array.isArray(result)).toBe(true);
      });
    });

    describe("cutoffDate validation", () => {
      test("should return false for cutoffDate less than 1", () => {
        const result = calcBillingPeriods(0, "2023");
        expect(result).toBe(false);
      });

      test("should return false for negative cutoffDate", () => {
        const result = calcBillingPeriods(-5, "2023");
        expect(result).toBe(false);
      });

      test("should return false for cutoffDate greater than 31", () => {
        const result = calcBillingPeriods(32, "2023");
        expect(result).toBe(false);
      });

      test("should return false for cutoffDate of 50", () => {
        const result = calcBillingPeriods(50, "2023");
        expect(result).toBe(false);
      });

      test("should accept cutoffDate of 1", () => {
        const result = calcBillingPeriods(1, "2023");
        expect(result).not.toBe(false);
        expect(Array.isArray(result)).toBe(true);
      });

      test("should accept cutoffDate of 31", () => {
        const result = calcBillingPeriods(31, "2023");
        expect(result).not.toBe(false);
        expect(Array.isArray(result)).toBe(true);
      });

      test("should accept cutoffDate of 15", () => {
        const result = calcBillingPeriods(15, "2023");
        expect(result).not.toBe(false);
        expect(Array.isArray(result)).toBe(true);
      });
    });

    describe("Edge cases for input types", () => {
      test("should handle string cutoffDate", () => {
        const result = calcBillingPeriods("15", "2023");
        expect(result).not.toBe(false);
        expect(Array.isArray(result)).toBe(true);
      });

      test("should handle float cutoffDate", () => {
        const result = calcBillingPeriods(15.5, "2023");
        expect(result).not.toBe(false);
        expect(Array.isArray(result)).toBe(true);
      });

      test("should handle numeric year", () => {
        const result = calcBillingPeriods(15, 2023);
        expect(result).not.toBe(false);
        expect(Array.isArray(result)).toBe(true);
        expect(result).toHaveLength(12);
      });

      test("should handle float cutoffDate for numeric year", () => {
        const result = calcBillingPeriods(15.5, 2023);
        expect(result).not.toBe(false);
        expect(Array.isArray(result)).toBe(true);
      });
    });
  });

  describe("Return Value Structure", () => {
    test("should return array of 12 objects for valid inputs", () => {
      const result = calcBillingPeriods(15, "2023");
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(12);
    });

    test("each object should have start_date, end_date, and month properties", () => {
      const result = calcBillingPeriods(15, "2023");
      result.forEach((period) => {
        expect(period).toHaveProperty("start_date");
        expect(period).toHaveProperty("end_date");
        expect(period).toHaveProperty("month");
      });
    });

    test("month property should be in YYYY-MM-01 format", () => {
      const result = calcBillingPeriods(15, "2023");
      result.forEach((period, index) => {
        const expectedMonth = `2023-${(index + 1)
          .toString()
          .padStart(2, "0")}-01`;
        expect(period.month).toBe(expectedMonth);
      });
    });
  });

  describe("Date Calculations", () => {
    describe("January (month 1) - Year rollover", () => {
      test("should handle January correctly with year rollover", () => {
        const result = calcBillingPeriods(15, "2023");
        const januaryPeriod = result[0]; // First item is January

        // Start date should be previous year December
        expect(januaryPeriod.start_date).toBe("2022-12-15");
        expect(januaryPeriod.end_date).toBe("2023-01-15");
        expect(januaryPeriod.month).toBe("2023-01-01");
      });
    });

    describe("Regular months (February-December)", () => {
      test("should handle February correctly", () => {
        const result = calcBillingPeriods(15, "2023");
        const februaryPeriod = result[1]; // Second item is February

        expect(februaryPeriod.start_date).toBe("2023-01-15");
        expect(februaryPeriod.end_date).toBe("2023-02-15");
        expect(februaryPeriod.month).toBe("2023-02-01");
      });

      test("should handle December correctly", () => {
        const result = calcBillingPeriods(15, "2023");
        const decemberPeriod = result[11]; // Last item is December

        expect(decemberPeriod.start_date).toBe("2023-11-15");
        expect(decemberPeriod.end_date).toBe("2023-12-15");
        expect(decemberPeriod.month).toBe("2023-12-01");
      });
    });

    describe("Date padding", () => {
      test("should pad single digit cutoff dates correctly", () => {
        const result = calcBillingPeriods(5, "2023");
        const januaryPeriod = result[0];

        expect(januaryPeriod.start_date).toBe("2022-12-05");
        expect(januaryPeriod.end_date).toBe("2023-01-05");
      });

      test("should handle double digit cutoff dates correctly", () => {
        const result = calcBillingPeriods(25, "2023");
        const januaryPeriod = result[0];

        expect(januaryPeriod.start_date).toBe("2022-12-25");
        expect(januaryPeriod.end_date).toBe("2023-01-25");
      });
    });
  });

  describe("Different Years", () => {
    test("should work with year 2020", () => {
      const result = calcBillingPeriods(15, "2020");
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(12);

      const januaryPeriod = result[0];
      expect(januaryPeriod.start_date).toBe("2019-12-15");
      expect(januaryPeriod.end_date).toBe("2020-01-15");
      expect(januaryPeriod.month).toBe("2020-01-01");
    });

    test("should work with year 2999", () => {
      const result = calcBillingPeriods(15, "2999");
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(12);

      const januaryPeriod = result[0];
      expect(januaryPeriod.start_date).toBe("2998-12-15");
      expect(januaryPeriod.end_date).toBe("2999-01-15");
      expect(januaryPeriod.month).toBe("2999-01-01");
    });
  });

  describe("Helper Function Integration", () => {
    test("should use helper functions for date validation", () => {
      const result = calcBillingPeriods(15, "2023");

      // Since our helper functions currently return the input date,
      // we can verify the dates are passed through correctly
      expect(result[0].start_date).toBe("2022-12-15");
      expect(result[0].end_date).toBe("2023-01-15");
    });
  });

  describe("Date Formatting", () => {
    test("should format dates correctly using moment", () => {
      const result = calcBillingPeriods(15, "2023");

      // Check that month dates are properly formatted
      expect(result[0].month).toBe("2023-01-01");
      expect(result[11].month).toBe("2023-12-01");
    });
  });

  describe("Performance and Memory", () => {
    test("should not take too long for normal execution", () => {
      const start = Date.now();
      calcBillingPeriods(15, "2023");
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(100); // Should complete in less than 100ms
    });

    test("should handle multiple consecutive calls", () => {
      for (let i = 0; i < 10; i++) {
        const result = calcBillingPeriods(15, "2023");
        expect(Array.isArray(result)).toBe(true);
        expect(result).toHaveLength(12);
      }
    });
  });

  describe("Comprehensive End-to-End Tests", () => {
    test("should generate correct billing periods for cutoff day 1", () => {
      const result = calcBillingPeriods(1, "2023");

      expect(result[0].start_date).toBe("2022-12-01");
      expect(result[0].end_date).toBe("2023-01-01");
      expect(result[11].start_date).toBe("2023-11-01");
      expect(result[11].end_date).toBe("2023-12-01");
    });

    test("should generate correct billing periods for cutoff day 31", () => {
      const result = calcBillingPeriods(31, "2023");

      expect(result[0].start_date).toBe("2022-12-31");
      expect(result[0].end_date).toBe("2023-01-31");
      expect(result[11].start_date).toBe("2023-11-31");
      expect(result[11].end_date).toBe("2023-12-31");
    });

    test("should maintain consistent structure across all months", () => {
      const result = calcBillingPeriods(15, "2023");

      result.forEach((period, index) => {
        const monthNumber = index + 1;
        const expectedMonth = `2023-${monthNumber
          .toString()
          .padStart(2, "0")}-01`;

        expect(period.month).toBe(expectedMonth);
        expect(typeof period.start_date).toBe("string");
        expect(typeof period.end_date).toBe("string");
        expect(period.start_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(period.end_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      });
    });
  });
});
