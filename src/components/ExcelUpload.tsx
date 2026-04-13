import React, { useState, useCallback, useRef } from 'react';
import { Upload, FileSpreadsheet, X, CheckCircle, AlertCircle, Loader2, Table } from 'lucide-react';
import NavBar from './NavBar';
import '../css/fileUpload.css'

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB


 interface UploadResponse {
  success: boolean;
  message: string;
  data: Record<string, any>[] | null;
  rowCount: number;
}

 interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}


const ExcelUpload: React.FC = () => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [response, setResponse] = useState<UploadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const validateFile = (file: File): string | null => {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    
    if (!validTypes.includes(file.type)) {
      return 'Please upload a valid Excel file (.xlsx or .xls)';
    }
    
    if (file.size > MAX_FILE_SIZE) {
      return 'File size must be less than 10MB';
    }
    
    return null;
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError(null);
    setResponse(null);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      const validationError = validateFile(droppedFile);
      
      if (validationError) {
        setError(validationError);
        return;
      }
      
      setFile(droppedFile);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setError(null);
    setResponse(null);

    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const validationError = validateFile(selectedFile);
      
      if (validationError) {
        setError(validationError);
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setProgress(null);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentage = Math.round((event.loaded * 100) / event.total);
          setProgress({
            loaded: event.loaded,
            total: event.total,
            percentage
          });
        }
      });

      const uploadPromise = new Promise<UploadResponse>((resolve, reject) => {
        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            resolve(JSON.parse(xhr.response));
          } else {
            reject(new Error(xhr.statusText || 'Upload failed'));
          }
        });
        
        xhr.addEventListener('error', () => reject(new Error('Network error')));
        xhr.addEventListener('abort', () => reject(new Error('Upload aborted')));
      });

      xhr.open('POST', 'https://crt-exam-app.onrender.com/api/excel/upload');
      xhr.send(formData);

      const result = await uploadPromise;
      setResponse(result);
      
      if (!result.success) {
        setError(result.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      setProgress(null);
    }
  };

  const clearFile = () => {
    setFile(null);
    setResponse(null);
    setError(null);
    setProgress(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
<div>
    
    <div>
        
    <NavBar />
    </div>
    <div className='fileMargin'>
       <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-green-500 to-emerald-500 mb-4">
              <FileSpreadsheet className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Excel Upload</h1>
            <p className="text-gray-300">Drag and drop your Excel file or click to browse</p>
          </div>

          {/* Drop Zone */}
          <div
            className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 ${
              dragActive
                ? 'border-purple-500 bg-purple-500/10'
                : 'border-white/20 hover:border-white/40 bg-white/5'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
              onChange={handleChange}
              className="hidden"
              id="excel-input"
            />
            
            <label
              htmlFor="excel-input"
              className="flex flex-col items-center justify-center cursor-pointer"
            >
              <Upload className={`w-12 h-12 mb-4 transition-colors ${
                dragActive ? 'text-purple-400' : 'text-gray-400'
              }`} />
              <p className="text-white font-medium mb-2">
                {dragActive ? 'Drop your file here' : 'Click or drag Excel file here'}
              </p>
              <p className="text-gray-400 text-sm">Supports .xlsx, .xls (Max 10MB)</p>
            </label>
          </div>

          {/* File Preview */}
          {file && (
            <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <FileSpreadsheet className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium truncate max-w-xs">{file.name}</p>
                    <p className="text-gray-400 text-sm">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <button
                  onClick={clearFile}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  disabled={uploading}
                >
                  <X className="w-5 h-5 text-gray-400 hover:text-white" />
                </button>
              </div>

              {/* Progress Bar */}
              {uploading && progress && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-300 mb-2">
                    <span>Uploading...</span>
                    <span>{progress.percentage}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${progress.percentage}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Upload Button */}
              {!uploading && !response && (
                <button
    onClick={handleUpload}
    className="mt-4 w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-black font-semibold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center space-x-2"
  >
    <Upload className="w-5 h-5 text-black" />
    <span>Upload File</span>
  </button>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center space-x-3 animate-shake">
              <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
              <p className="text-red-200">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {response?.success && (
            <div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl animate-fade-in">
              <div className="flex items-center space-x-3 mb-4">
                <CheckCircle className="w-6 h-6 text-green-400" />
                <div>
                  <p className="text-green-200 font-semibold">{response.message}</p>
                  <p className="text-green-300/70 text-sm">
                    Processed {response.rowCount} rows successfully
                  </p>
                </div>
              </div>

              
            </div>
          )}

          {/* Loading State */}
          {uploading && !progress && (
            <div className="mt-6 flex items-center justify-center space-x-3 text-gray-300">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Preparing upload...</span>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
    </div>
    </div>
    
  );
};

export default ExcelUpload;