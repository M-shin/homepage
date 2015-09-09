<?php
if(isset($_GET['secindex'])){
    if((int)$_GET['secindex'] == 1){
        $ra = rand(2000,2000000);
        $nh = fopen('auth.txt', 'w');
        fwrite($nh, $ra);
        fclose($nh);
        echo $ra;
    }
}else if(isset($_POST['scorec']) && isset($_POST['namea']) && isset($_POST['mode']) && isset($_POST['key'])){
    $auth = array('2','3','5','7','9','11','13','15','17','19','21','23','25','1234','4321','123','333','2424');
    $nh = fopen('auth.txt', 'r');
    $ind = (int)fgets($nh);
    $num = (int)$auth[$ind % count($auth)];
    fclose($nh);
    if(preg_match("/^[A-Za-z0-9 ]+$/", $_POST['namea']) == 0 || (int)$_POST['scorec'] > 15000 || (int)$_POST['scorec'] < 0 || (int)$_POST['key'] != $num || strlen($_POST['namea']) > 13){
    }else {
    $handle = fopen($_POST['mode'].'scores-file.txt', 'r') or die('e');
    $scores = array();
    $index = 0;
    $playerScore = (int)$_POST['scorec'];
    while(!feof($handle)) {
        $scoreline = fgets($handle);
        $scores[$index] = str_replace("\n","",$scoreline);
        $index++;
    }
    $scores[$index] = '999%'.$_POST['namea'].'%'.$playerScore;
    for($i = 0; $i < count($scores)+1; $i++){
        for($j = 0; $j < count($scores); $j++){
            $l1 = explode("%", $scores[$j]);
            $l2 = explode("%", $scores[$j+1]);
            if((int)$l1[2] < (int)$l2[2]){
                $temp = $scores[$j];
                $scores[$j] = $scores[$j+1];
                $scores[$j+1] = $temp;
            }
        }
    }
    fclose($handle);
    $handle = fopen($_POST['mode'] . 'scores-file.txt', 'w');
    
    for($i = 0; $i < count($scores); $i++){
        $L = explode("%", $scores[$i]);
        
        fwrite($handle, ($i + 1)."%".$L[1]."%".$L[2]);
        if($i != count($scores) - 1){
            fwrite($handle, "\n");
        }
    }
    fclose($handle);
    /*
    $added = false;
    for($i = 0; $i < count($scores); $i++) {
        $evalLine = $scores[$i];
        $evalArray = explode("%", $evalLine);
        $evalScore = (int)$evalArray[2];
        if($playerScore > $evalScore){
            for($j = count($scores); $j > $i; $j--){
                $evalLine2 = $scores[$j-1];
                $evalArray2 = explode("%", $evalLine2);
                $scores[$j] = (((int)$evalArray2[0]) + 1) . '%' . $evalArray2[1] . '%' . $evalArray2[2];   
            }
            $scores[$i] = ($i + 1) . '%' . $_POST['namea'] . '%' . $playerScore . "\n";
            $added = true;
            break;
        }
    }
    if(!$added){
        $scores[$index] = ($index + 1) . '%' . $_POST['namea'] . '%' . $playerScore;
        //echo 'added';
    }
    
    fclose($handle);
    $handle = fopen($_POST['mode'] . 'scores-file.txt', 'w');
    for($i = 0; $i < count($scores); $i++){
        if(!$added && $i == count($scores) - 2) {
            fwrite($handle, $scores[$i]. "\n");
        } else {
            fwrite($handle, $scores[$i]);
        }
        //echo $scores[$i];
    }
    fclose($handle);
    */
    echo 's';
    }
}else if(isset($_POST['board']) && $_POST['board'] == 'yes' && isset($_POST['mode'])){
    $handle = fopen($_POST['mode'].'scores-file.txt', 'r') or die('e');
    $message = '';
    while(!feof($handle)){
        $message = $message . fgets($handle);
    }
    fclose($handle);
    echo $message;
    
}else {
    foreach($_POST as $key => $val){
        echo "$key => $val";
    }
    
}
?>
