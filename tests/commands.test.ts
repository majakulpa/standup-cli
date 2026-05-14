import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { addEntry, listEntries, clearEntries } from '../src/commands';
import { readStore, writeStore, Store } from '../src/storage';

// Mock the console methods to capture output
const consoleSpy = {
  log: jest.spyOn(console, 'log').mockImplementation(),
  error: jest.spyOn(console, 'error').mockImplementation(),
};

// Mock the storage directory to use a temp directory for tests
const mockStoreDir = path.join(os.tmpdir(), 'standup-cli-tests');
const mockStoreFile = path.join(mockStoreDir, 'data.json');

// Mock the storage module to use temp directory
jest.mock('../src/storage', () => {
  const original = jest.requireActual('../src/storage');
  return {
    ...original,
    readStore: jest.fn(),
    writeStore: jest.fn(),
    todayString: () => '2026-05-14', // Fixed date for testing
  };
});

const mockReadStore = readStore as jest.MockedFunction<typeof readStore>;
const mockWriteStore = writeStore as jest.MockedFunction<typeof writeStore>;

describe('standup commands', () => {
  beforeEach(() => {
    // Clear all mocks
    consoleSpy.log.mockClear();
    consoleSpy.error.mockClear();
    mockReadStore.mockClear();
    mockWriteStore.mockClear();

    // Setup default mock store
    mockReadStore.mockReturnValue({ entries: [] });
  });

  afterAll(() => {
    // Restore console methods
    consoleSpy.log.mockRestore();
    consoleSpy.error.mockRestore();
  });

  describe('addEntry', () => {
    test('should add a new entry to empty store', () => {
      const mockStore: Store = { entries: [] };
      mockReadStore.mockReturnValue(mockStore);

      addEntry('Test entry text');

      expect(mockReadStore).toHaveBeenCalledTimes(1);
      expect(mockWriteStore).toHaveBeenCalledTimes(1);

      const savedStore = mockWriteStore.mock.calls[0][0];
      expect(savedStore.entries).toHaveLength(1);
      expect(savedStore.entries[0].text).toBe('Test entry text');
      expect(savedStore.entries[0].date).toBe('2026-05-14');
      expect(savedStore.entries[0].id).toBeDefined();
      expect(savedStore.entries[0].createdAt).toBeDefined();

      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining('✔ Entry added: Test entry text')
      );
    });

    test('should add entry to store with existing entries', () => {
      const mockStore: Store = {
        entries: [{
          id: 'existing-id',
          text: 'Existing entry',
          date: '2026-05-14',
          createdAt: new Date().toISOString()
        }]
      };
      mockReadStore.mockReturnValue(mockStore);

      addEntry('New entry');

      const savedStore = mockWriteStore.mock.calls[0][0];
      expect(savedStore.entries).toHaveLength(2);
      expect(savedStore.entries[1].text).toBe('New entry');
    });

    test('should trim whitespace from entry text', () => {
      mockReadStore.mockReturnValue({ entries: [] });

      addEntry('  Text with spaces  ');

      const savedStore = mockWriteStore.mock.calls[0][0];
      expect(savedStore.entries[0].text).toBe('Text with spaces');
    });
  });

  describe('listEntries', () => {
    test('should show message when no entries exist for today', () => {
      mockReadStore.mockReturnValue({ entries: [] });

      listEntries();

      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining('No entries for 2026-05-14')
      );
      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining('standup add')
      );
    });

    test('should list entries for today', () => {
      const mockStore: Store = {
        entries: [
          {
            id: 'id1',
            text: 'Entry 1',
            date: '2026-05-14',
            createdAt: new Date().toISOString()
          },
          {
            id: 'id2',
            text: 'Entry 2',
            date: '2026-05-14',
            createdAt: new Date().toISOString()
          },
          {
            id: 'id3',
            text: 'Entry from different day',
            date: '2026-05-13',
            createdAt: new Date().toISOString()
          }
        ]
      };
      mockReadStore.mockReturnValue(mockStore);

      listEntries();

      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining('📋 Entries for 2026-05-14')
      );
      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining('1. Entry 1')
      );
      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining('2. Entry 2')
      );
      // Should not include entry from different day
      expect(consoleSpy.log).not.toHaveBeenCalledWith(
        expect.stringContaining('Entry from different day')
      );
    });

    test('should list entries for specific date', () => {
      const mockStore: Store = {
        entries: [
          {
            id: 'id1',
            text: 'Entry for May 13',
            date: '2026-05-13',
            createdAt: new Date().toISOString()
          }
        ]
      };
      mockReadStore.mockReturnValue(mockStore);

      listEntries('2026-05-13');

      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining('📋 Entries for 2026-05-13')
      );
      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining('1. Entry for May 13')
      );
    });
  });
});