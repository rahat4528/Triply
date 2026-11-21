import { parseCSV, detectDelimiter, stripBOM, inferType } from '../data-processing/csv-parser';

describe('CSV Parser & Ingestion Engine', () => {
  it('detects delimiters correctly across comma, tab, semicolon, pipe', () => {
    expect(detectDelimiter('id,name,latitude,longitude')).toBe(',');
    expect(detectDelimiter('id\tname\tlatitude\tlongitude')).toBe('\t');
    expect(detectDelimiter('id;name;latitude;longitude')).toBe(';');
    expect(detectDelimiter('id|name|latitude|longitude')).toBe('|');
  });

  it('strips UTF-8 Byte Order Marks (BOM)', () => {
    const raw = '\uFEFFlatitude,longitude,name\n51.5,-0.1,London';
    const { text, hasBOM } = stripBOM(raw);
    expect(hasBOM).toBe(true);
    expect(text.startsWith('latitude')).toBe(true);
  });

  it('infers data types accurately from values', () => {
    expect(inferType(['1', '2', '3'])).toBe('INTEGER');
    expect(inferType(['1.5', '2.8', '3.1'])).toBe('FLOAT');
    expect(inferType(['true', 'false', 'true'])).toBe('BOOLEAN');
    expect(inferType(['2023-01-01', '2023-01-02'])).toBe('TIMESTAMP');
    expect(inferType(['London', 'Paris', 'Tokyo'])).toBe('STRING');
  });

  it('detects coordinate swap heuristics and flags out-of-bounds latitude', () => {
    const swappedCSV = `name,lat,lon\nSwapped Point,120.5,31.2`;
    const res = parseCSV(swappedCSV);
    expect(res.invalidRowsCount).toBe(1);
    expect(res.issues[0].reason).toContain('appear swapped');
  });

  it('successfully parses valid spatial CSV data', () => {
    const validCSV = `station_name,lat,lon,pm25\nWestminster,51.5002,-0.1194,14.2\nWaterloo,51.5032,-0.1123,19.8`;
    const res = parseCSV(validCSV);
    expect(res.validRowsCount).toBe(2);
    expect(res.columns.find((c) => c.name === 'lat')?.isLatitude).toBe(true);
    expect(res.columns.find((c) => c.name === 'lon')?.isLongitude).toBe(true);
  });
});
