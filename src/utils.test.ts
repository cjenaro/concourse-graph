import { describe, it, expect } from 'vitest'
import { getDay, getCommitsLevel, getMonthLabel, getMonthLabels } from './utils'

describe('getDay', () => {
	it('should return the correct formatted date string with the appropriate suffix', () => {
		expect(getDay(1627790400, 0)).toBe('August 1st')
		expect(getDay(1627790400, 1)).toBe('August 2nd')
		expect(getDay(1627790400, 2)).toBe('August 3rd')
		expect(getDay(1627790400, 3)).toBe('August 4th')
		expect(getDay(1627790400, 10)).toBe('August 11th')
	})
})

describe('getCommitsLevel', () => {
	it('should return 0 when dayCommits is less than 1', () => {
		expect(getCommitsLevel(10, 0)).toBe(0)
	})

	it('should return 1 when dayCommits is less than levelGap', () => {
		expect(getCommitsLevel(10, 5)).toBe(1)
	})

	it('should return 2 when dayCommits is between levelGap and levelGap * 2', () => {
		expect(getCommitsLevel(10, 15)).toBe(2)
	})

	it('should return 3 when dayCommits is between levelGap * 2 and levelGap * 3', () => {
		expect(getCommitsLevel(10, 25)).toBe(3)
	})

	it('should return 4 when dayCommits is greater than or equal to levelGap * 3', () => {
		expect(getCommitsLevel(10, 35)).toBe(4)
	})
})

describe('getMonthLabel', () => {
	it('should return the correct month label', () => {
		expect(getMonthLabel(new Date('2024-08-11T00:00:00Z'))).toBe('Aug')
		expect(getMonthLabel(new Date('2024-01-01T00:00:00Z'))).toBe('Jan')
	})
})

describe('getMonthLabels', () => {
	it('should return correct month labels and spans', () => {
		const mockData = [
			{ total: 10, days: [1, 2, 3, 4, 5, 6, 7], week: 1627790400 },
			{ total: 15, days: [1, 2, 3, 4, 5, 6, 7], week: 1628395200 },
			{ total: 20, days: [1, 2, 3, 4, 5, 6, 7], week: 1631196000 },
		]

		const result = getMonthLabels(mockData)

		expect(result).toEqual([
			{ label: 'Aug', spans: 2 },
			{ label: 'Sep', spans: 1 },
		])
	})
})
