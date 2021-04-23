<?php

function _print($data) {
    print '<pre>';
    print_r($data);
    print '</pre>';
}

$ext = @$_POST['ext'];

$fileName = md5(uniqid().time().rand(000000, 999999));
$fullFileName = "$fileName.{$ext}";

$create = touch(__DIR__ . "/image/{$fullFileName}");

if($create) {
    echo json_encode([
        'status' => 'ok',
        'message' => 'Berhasil membuat file',
        'data' => [
            'name' => $fullFileName
        ]
    ]);
} else {
    echo json_encode([
        'status' => 'fail',
        'message' => 'Gagal membuat file',
    ]);
}