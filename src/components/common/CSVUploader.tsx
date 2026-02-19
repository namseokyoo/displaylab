/**
 * CSV Uploader Component
 *
 * Drag-and-drop CSV upload with template download support.
 */

import { useState, useRef, useCallback } from 'react';
import type { DragEvent, ChangeEvent } from 'react';
import { parseCSVFile, type ParsedRow } from '@/lib/csv-parser';

interface CSVUploaderProps {
  onDataLoaded: (data: ParsedRow[]) => void;
  expectedColumns?: string[];
  acceptedFormats?: string;
  maxRows?: number;
}

export default function CSVUploader({
  onDataLoaded,
  expectedColumns,
  acceptedFormats = '.csv,.txt',
  maxRows = 1000,
}: CSVUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      setFileName(file.name);

      try {
        const rows = await parseCSVFile(file, expectedColumns);
        if (rows.length === 0) {
          setError('No valid data found in file');
          return;
        }
        if (rows.length > maxRows) {
          setError(`File exceeds maximum ${maxRows} rows (Free tier limit)`);
          return;
        }
        onDataLoaded(rows);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to parse file');
      }
    },
    [expectedColumns, maxRows, onDataLoaded],
  );

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  return (
    <div className="w-full">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          isDragging
            ? 'border-blue-400 bg-blue-400/10'
            : 'border-gray-700 hover:border-gray-500 bg-gray-900/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFormats}
          onChange={handleInputChange}
          className="hidden"
        />
        <div className="text-gray-400">
          <svg
            className="w-10 h-10 mx-auto mb-3 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          {fileName ? (
            <p className="text-sm text-blue-400">{fileName}</p>
          ) : (
            <>
              <p className="text-sm font-medium">Drop CSV file here or click to browse</p>
              <p className="text-xs text-gray-500 mt-1">
                Supports CSV, TSV, TXT (max {maxRows} rows)
              </p>
            </>
          )}
        </div>
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
