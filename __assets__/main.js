$(function()
{
  $(document.body).on('click', '.disabled, .disabled a', function() { return false; });
});

function finalizeJs()
{
  $('input.select2-offscreen[tabindex="-1"]').on('focus', function()
  {
    $(this).select2('focus');
  });
}
