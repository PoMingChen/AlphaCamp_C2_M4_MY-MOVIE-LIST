// function to remove a specific number from an array
function removeNumber (arr, num) {
  const index = arr.indexOf(num)
  if (index !== -1) {
    arr.splice(index