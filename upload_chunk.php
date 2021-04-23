<?php
function _print($data) {
    print '<pre>';
    print_r($data);
    print '</pre>';
}

function decode_chunk( $data ) {
    $data = explode( ';base64,', $data );

    if ( ! is_array( $data ) || ! isset( $data[1] ) ) {
        return false;
    }

    $data = base64_decode( $data[1] );
    if ( ! $data ) {
        return false;
    }

    return $data;
}

$fileName = @$_POST['file'];
$chunk = @$_POST['data'];

$data = decode_chunk($chunk);

$append = file_put_contents(__DIR__."/file/{$fileName}", $data, FILE_APPEND);

if($append) {
    echo json_encode([ 'status' => 'ok' ]);
} else {
    echo json_encode([ 'status' => 'fail' ]);
}