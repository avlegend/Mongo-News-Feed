$(document).on('click','.trashButton', function(){
    const commentId = $(this).attr('data-id');
    $.ajax({
        url:'/api/comment/'+ commentId,
        method:'DELETE'
    }).done(function(response,err){
        console.log(err,response);
        
     
        window.location.reload();
    })
});