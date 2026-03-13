<?php

namespace Core;

class Uploader
{
    private $targetDir;
    private $maxSize;
    private $file;
    private $ext;
    private $errors = array();
    private $uploadedFileName;
    private $randomString;

    const ALLOWED_FILE_TYPES_MIME = [
        'jpg' => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'png' => 'image/png',
        'gif' => 'image/gif',
        'webp' => 'image/webp',
        'mp4' => 'video/mp4'
    ];

    public function __construct($file, $maxSize = null , $targetDir = null){
        $this->file = $file;
        $this->maxSize = ( $maxSize ?? 5 ) * 1024 * 1024;
        $this->targetDir = $targetDir ?? $_SERVER["DOCUMENT_ROOT"] . "/app/uploads/";
        $this->ext = strtolower(pathinfo($this->file['name'], PATHINFO_EXTENSION));
    }

    public function upload()
    {
        if($this->checkFileType()){
            $this->errors["file_type"] = "This file type is not allowed.";
        }

        if($this->checkMimeType()){
            $this->errors["file_mime"] = "This file mime type is not allowed.";
        }
        if($this->checkSize()){
            $this->errors["file_size"] = "This file size is not allowed.";
        }
        if(!$this->checkErrors()) {
            $this->move();
        }
        return $this->report();
    }

    private function checkFileType(){
        return !in_array($this->ext, array_keys(self::ALLOWED_FILE_TYPES_MIME));
    }

    private function checkMimeType(){
        return !in_array(mime_content_type($this->file["tmp_name"]), self::ALLOWED_FILE_TYPES_MIME);
    }

    private function checkSize(){
        return $this->maxSize <= $this->file["size"];
    }

    private function checkErrors(){
        if(!empty($this->errors)){
            return true;
        }
        return false;
    }
    private function report(){
        return [
            "ok" => !$this->checkErrors(),
            "errors" => $this->errors,
            "path" => $this->targetDir,
            "filename" => $this->randomString,
            "ext" => $this->ext,
            "fullfilename" => $this->uploadedFileName
        ];
    }

    private function setPrefix(){
        return match ($this->ext) {
            "mp4" => "VID_",
            default => "IMG_"
        };
    }

    private function move(){
        $this->randomString = uniqid($this->setPrefix());
        $this->uploadedFileName =  $this->randomString . "." . $this->ext;
        if (move_uploaded_file($this->file["tmp_name"], $this->targetDir . $this->uploadedFileName)) {
            return true;
        }
        $this->errors["upload_error"] = "There was an error uploading your file.";
        return false;
    }

}