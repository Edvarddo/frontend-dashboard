// src/components/FileUpload.jsx
import { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Upload, X, File, ImageIcon, FileText, Eye, Camera } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const getFileIcon = (type) => {
  if (type.startsWith("image/")) return <ImageIcon className="w-5 h-5 text-blue-500" />;
  if (type === "application/pdf") return <FileText className="w-5 h-5 text-red-500" />;
  if (type.includes("word")) return <FileText className="w-5 h-5 text-blue-600" />;
  return <File className="w-5 h-5 text-gray-500" />;
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const FileUpload = ({
  files,
  isDragging,
  handleFileChange,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  removeFile,
  maxFiles = 5,
  uploadProgress = {},
  isUploading,
}) => {
  const fileInputRef = useRef(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Label className="text-lg font-semibold text-green-700">Evidencia</Label>
        <Badge variant="outline" className="text-xs">
          {files.length}/{maxFiles} archivos
        </Badge>
      </div>

      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${isDragging
          ? "border-green-500 bg-green-50"
          : "border-gray-300 hover:border-green-400 hover:bg-gray-50"
          }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2">
            <Upload className="w-8 h-8 text-green-500" />
            <Camera className="w-6 h-6 text-blue-500" />
            <FileText className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <p className="text-lg font-medium text-gray-700">
              Arrastra archivos aquí o{" "}
              <Button
                type="button"
                variant="link"
                className="p-0 h-auto text-green-600 font-semibold"
                onClick={() => fileInputRef.current?.click()}
              >
                selecciona archivos
              </Button>
            </p>
            <p className="text-sm text-gray-500 mt-1">Imágenes, PDFs, documentos • Máximo 10MB por archivo</p>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.txt,.xls,.xlsx"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {files.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-700">Archivos seleccionados:</h4>
          <div className="space-y-2">
            {files.map((fileData) => (
              <div key={fileData.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                <div className="flex-shrink-0">
                  {fileData.preview ? (
                    <div className="relative">
                      <img
                        src={fileData.preview}
                        alt={fileData.name}
                        className="w-12 h-12 object-cover rounded border"
                      />
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="absolute -top-1 -right-1 w-6 h-6 bg-white shadow-sm"
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                          <DialogHeader>
                            <DialogTitle>{fileData.name}</DialogTitle>
                          </DialogHeader>
                          <img
                            src={fileData.preview}
                            alt={fileData.name}
                            className="w-full h-auto max-h-[70vh] object-contain"
                          />
                        </DialogContent>
                      </Dialog>
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-white rounded border flex items-center justify-center">
                      {getFileIcon(fileData.type)}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900 truncate">{fileData.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(fileData.size)}</p>

                  {isUploading && (
                    <div className="mt-2">
                      <Progress value={uploadProgress[fileData.id] || 0} className="h-2" />
                      <p className="text-xs text-blue-600 mt-1">
                        Subiendo... {uploadProgress[fileData.id] || 0}%
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => removeFile(fileData.id)}
                    className="w-8 h-8 text-red-500 hover:bg-red-50"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;