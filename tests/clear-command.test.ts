import { clearEntries } from '../src/commands';
import { readStore, writeStore, Store } from '../src/storage';

// Mock readline
const mockQuestion = jest.fn();
const mockClose = jest.fn();
const mockCreateInterface = jest.fn().mockReturnValue({
  question: mockQuestion,
  close: mockClose,
});

jest.mock('readline', () => ({
  createInterface: mockCreateInterface,
}));

// Mock console
const consoleSpy = {
  log: jest.spyOn(console, 'log').mockImplementation(),
};

// Mock the storage module
jest.mock('../src/storage', () => ({
  readStore: jest.fn(),
  writeStore: jest.fn(),
  todayString: () => '2026-05-14',
}));

const mockReadStore = readStore as jest.MockedFunction<typeof readStore>;
const mockWriteStore = writeStore as jest.MockedFunction<typeof writeStore>;

describe('clearEntries command', () => {
  beforeEach(() => {
    // Clear all mocks
    consoleSpy.log.mockClear();
    mockReadStore.mockClear();
    mockWriteStore.mockClear();
    mockQuestion.mockClear();
    mockClose.mockClear();
    mockCreateInterface.mockClear();
  });

  afterAll(() => {
    consoleSpy.log.mockRestore();
  });

  test('should show message when no entries exist for today', () => {
    mockReadStore.mockReturnValue({ entries: [] });

    clearEntries();

    expect(consoleSpy.log).toHaveBeenCalledWith(
      expect.stringContaining('No entries found for 2026-05-14')
    );
    expect(mockQuestion).not.toHaveBeenCalled();
  });

  test('should show message when no entries exist for specific date', () => {
    mockReadStore.mockReturnValue({ entries: [] });

    clearEntries('2026-05-13');

    expect(consoleSpy.log).toHaveBeenCalledWith(
      expect.stringContaining('No entries found for 2026-05-13')
    );
    expect(mockQuestion).not.toHaveBeenCalled();
  });

  test('should show warning and prompt confirmation for today', () => {
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
        }
      ]
    };
    mockReadStore.mockReturnValue(mockStore);

    clearEntries();

    expect(consoleSpy.log).toHaveBeenCalledWith(
      expect.stringContaining('⚠️  You are about to delete 2 entry(ies) for today')
    );
    expect(mockQuestion).toHaveBeenCalledWith(
      expect.stringContaining('Are you sure? (y/N):'),
      expect.any(Function)
    );
  });

  test('should show warning and prompt confirmation for specific date', () => {
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

    clearEntries('2026-05-13');

    expect(consoleSpy.log).toHaveBeenCalledWith(
      expect.stringContaining('⚠️  You are about to delete 1 entry(ies) for 2026-05-13')
    );
    expect(mockQuestion).toHaveBeenCalled();
  });

  test('should delete entries when user confirms with "y"', () => {
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
          text: 'Entry from different day',
          date: '2026-05-13',
          createdAt: new Date().toISOString()
        }
      ]
    };
    mockReadStore.mockReturnValue(mockStore);

    // Mock user confirming with 'y'
    mockQuestion.mockImplementation((question, callback) => {
      callback('y');
    });

    clearEntries();

    const savedStore = mockWriteStore.mock.calls[0][0];
    expect(savedStore.entries).toHaveLength(1);
    expect(savedStore.entries[0].date).toBe('2026-05-13'); // Should keep entry from different day

    expect(consoleSpy.log).toHaveBeenCalledWith(
      expect.stringContaining('✔ All entries for today have been deleted')
    );
    expect(mockClose).toHaveBeenCalled();
  });

  test('should delete entries when user confirms with "yes"', () => {
    const mockStore: Store = {
      entries: [
        {
          id: 'id1',
          text: 'Entry 1',
          date: '2026-05-14',
          createdAt: new Date().toISOString()
        }
      ]
    };
    mockReadStore.mockReturnValue(mockStore);

    mockQuestion.mockImplementation((question, callback) => {
      callback('yes');
    });

    clearEntries();

    const savedStore = mockWriteStore.mock.calls[0][0];
    expect(savedStore.entries).toHaveLength(0);
    expect(mockWriteStore).toHaveBeenCalled();
    expect(mockClose).toHaveBeenCalled();
  });

  test('should cancel deletion when user responds with "n"', () => {
    const mockStore: Store = {
      entries: [
        {
          id: 'id1',
          text: 'Entry 1',
          date: '2026-05-14',
          createdAt: new Date().toISOString()
        }
      ]
    };
    mockReadStore.mockReturnValue(mockStore);

    mockQuestion.mockImplementation((question, callback) => {
      callback('n');
    });

    clearEntries();

    expect(mockWriteStore).not.toHaveBeenCalled();
    expect(consoleSpy.log).toHaveBeenCalledWith(
      expect.stringContaining('Cancelled')
    );
    expect(mockClose).toHaveBeenCalled();
  });

  test('should cancel deletion when user responds with empty string', () => {
    const mockStore: Store = {
      entries: [
        {
          id: 'id1',
          text: 'Entry 1',
          date: '2026-05-14',
          createdAt: new Date().toISOString()
        }
      ]
    };
    mockReadStore.mockReturnValue(mockStore);

    mockQuestion.mockImplementation((question, callback) => {
      callback('');
    });

    clearEntries();

    expect(mockWriteStore).not.toHaveBeenCalled();
    expect(consoleSpy.log).toHaveBeenCalledWith(
      expect.stringContaining('Cancelled')
    );
    expect(mockClose).toHaveBeenCalled();
  });

  test('should delete entries for specific date when confirmed', () => {
    const mockStore: Store = {
      entries: [
        {
          id: 'id1',
          text: 'Entry for May 13',
          date: '2026-05-13',
          createdAt: new Date().toISOString()
        },
        {
          id: 'id2',
          text: 'Entry for May 14',
          date: '2026-05-14',
          createdAt: new Date().toISOString()
        }
      ]
    };
    mockReadStore.mockReturnValue(mockStore);

    mockQuestion.mockImplementation((question, callback) => {
      callback('y');
    });

    clearEntries('2026-05-13');

    const savedStore = mockWriteStore.mock.calls[0][0];
    expect(savedStore.entries).toHaveLength(1);
    expect(savedStore.entries[0].date).toBe('2026-05-14'); // Should keep entry from different day

    expect(consoleSpy.log).toHaveBeenCalledWith(
      expect.stringContaining('✔ All entries for 2026-05-13 have been deleted')
    );
  });
});