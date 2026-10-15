'use strict';
// Select the established owner journey through the visible landing controls.
// Tests for the ownership gate itself must exercise it directly.
module.exports=async function chooseOwner(page){
  const address=page.locator('#addressSearch');
  const owner=page.locator('#ownershipChoice [data-ownership="owner"]');
  if(await address.count()&&await address.isDisabled()&&await owner.isVisible()){
    await owner.click();
    await page.waitForFunction(()=>{const input=document.querySelector('#addressSearch');return input&&!input.disabled;});
  }
};
