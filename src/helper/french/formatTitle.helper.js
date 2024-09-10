function formatTitle(title, data_id) {
  let formattedTitle = title.replace(/[^\w\s]/g, "");
  formattedTitle = formattedTitle.toLowerCase();
  formattedTitle = formattedTitle.replace(/\s+/g, "-");
  formattedTitle = `${data_id}-${formattedTitle}`;
  return formattedTitle;
}
  
  export default formatTitle;
  