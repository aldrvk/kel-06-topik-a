<?php

$srcDir = __DIR__ . '/resources/js/Pages/Doorsmeer';
$bengkelDir = __DIR__ . '/resources/js/Pages/Bengkel';
$psDir = __DIR__ . '/resources/js/Pages/RentalPs';

@mkdir($bengkelDir, 0777, true);
@mkdir($psDir, 0777, true);

$files = ['index.tsx', 'tracking.tsx', 'my_bookings.tsx'];
foreach ($files as $f) {
    $content = file_get_contents("$srcDir/$f");
    
    // BENGKEL REPLACEMENTS
    $bContent = str_replace('Doorsmeer', 'Bengkel', $content);
    $bContent = str_replace('doorsmeer', 'bengkel', $bContent);
    $bContent = str_replace('washing', 'servicing', $bContent);
    $bContent = str_replace('Washing', 'Servicing', $bContent);
    $bContent = str_replace('Bay', 'Pit', $bContent);
    $bContent = str_replace('bay', 'pit', $bContent);
    $bContent = str_replace('mencuci', 'menservis', $bContent);
    $bContent = str_replace('dicuci', 'diservis', $bContent);
    $bContent = str_replace('Car Wash', 'Auto Service', $bContent);
    file_put_contents("$bengkelDir/$f", $bContent);

    // RENTAL PS REPLACEMENTS
    $pContent = str_replace('Doorsmeer', 'RentalPs', $content);
    $pContent = str_replace('doorsmeer', 'rental-ps', $pContent);
    $pContent = str_replace('washing', 'playing', $pContent);
    $pContent = str_replace('Washing', 'Playing', $pContent);
    $pContent = str_replace('Bay Pencucian', 'Ruang TV', $pContent);
    $pContent = str_replace('bay pencucian', 'ruang TV', $pContent);
    $pContent = str_replace('Bay tersedia', 'TV tersedia', $pContent);
    $pContent = str_replace('bay', 'TV', $pContent);
    $pContent = str_replace('Bay', 'TV', $pContent);
    $pContent = str_replace('kendaraan', 'sesi', $pContent);
    $pContent = str_replace('Kendaraan', 'Sesi', $pContent);
    $pContent = str_replace('mencuci', 'bermain', $pContent);
    $pContent = str_replace('dicuci', 'bermain', $pContent);
    $pContent = str_replace('Car Wash', 'PlayStation', $pContent);
    file_put_contents("$psDir/$f", $pContent);
}

// ADMIN BENGKEL
$bAdmin = file_get_contents(__DIR__ . '/resources/js/Pages/Admin/BookingDoorsmeer.tsx');
$bAdmin = str_replace('Doorsmeer', 'Bengkel', $bAdmin);
$bAdmin = str_replace('doorsmeer', 'bengkel', $bAdmin);
$bAdmin = str_replace('washing', 'servicing', $bAdmin);
$bAdmin = str_replace('Washing', 'Servicing', $bAdmin);
$bAdmin = str_replace('Bay', 'Pit', $bAdmin);
$bAdmin = str_replace('bay', 'pit', $bAdmin);
$bAdmin = str_replace('Dicuci', 'Diservis', $bAdmin);
file_put_contents(__DIR__ . '/resources/js/Pages/Admin/BookingBengkel.tsx', $bAdmin);

$bWalk = file_get_contents(__DIR__ . '/resources/js/Pages/Admin/DoorsmeerWalkIn.tsx');
$bWalk = str_replace('Doorsmeer', 'Bengkel', $bWalk);
$bWalk = str_replace('doorsmeer', 'bengkel', $bWalk);
file_put_contents(__DIR__ . '/resources/js/Pages/Admin/BengkelWalkIn.tsx', $bWalk);

// ADMIN RENTAL PS
$pAdmin = file_get_contents(__DIR__ . '/resources/js/Pages/Admin/BookingDoorsmeer.tsx');
$pAdmin = str_replace('Doorsmeer', 'RentalPs', $pAdmin);
$pAdmin = str_replace('doorsmeer', 'rental-ps', $pAdmin);
$pAdmin = str_replace('washing', 'playing', $pAdmin);
$pAdmin = str_replace('Washing', 'Playing', $pAdmin);
$pAdmin = str_replace('Bay Pencucian', 'Ruang TV', $pAdmin);
$pAdmin = str_replace('Bay', 'TV', $pAdmin);
$pAdmin = str_replace('bay', 'TV', $pAdmin);
$pAdmin = str_replace('Dicuci', 'Bermain', $pAdmin);
$pAdmin = str_replace('kendaraan', 'sesi', $pAdmin);
file_put_contents(__DIR__ . '/resources/js/Pages/Admin/BookingRentalPs.tsx', $pAdmin);

$pWalk = file_get_contents(__DIR__ . '/resources/js/Pages/Admin/DoorsmeerWalkIn.tsx');
$pWalk = str_replace('Doorsmeer', 'RentalPs', $pWalk);
$pWalk = str_replace('doorsmeer', 'rental-ps', $pWalk);
file_put_contents(__DIR__ . '/resources/js/Pages/Admin/RentalPsWalkIn.tsx', $pWalk);

echo "OK";
