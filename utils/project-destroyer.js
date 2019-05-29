async function destroyAllProjects(page) {
    await page.waitFor(2000)

    await page.goto('https://console.developers.google.com/cloud-resource-manager?folder=&organizationId=0&hl=pt-br&supportedpurview=project')
    await page.waitFor(10000)
    
    const selectorElementsOfTable = '[class="mat-pseudo-checkbox ng-star-inserted"]'
    const listOfProjectsElements = await page.$$(selectorElementsOfTable)
    

    for (let elementId = 1; elementId < listOfProjectsElements.length; elementId++) {
        console.log(`\n> deleting project nº ${elementId}`)

        await listOfProjectsElements[elementId].click()

        const deleteButtonSelector = '#delete-button'
        await page.waitForSelector(deleteButtonSelector)
        await page.click(deleteButtonSelector)

        await page.waitFor(2000)

        const projectIdSelector = 'body > div.cdk-overlay-container.cfc-ng2-region > div.cdk-global-overlay-wrapper > div > mat-dialog-container > ng-component > div.mat-dialog-content > p > b'
        await page.waitForSelector(projectIdSelector)
        const projectId = await page.evaluate((projectIdSelector) => {
            return document.querySelector(projectIdSelector).innerHTML.trim()
        }, projectIdSelector)

        const projectIdInputSelector = 'body > div.cdk-overlay-container.cfc-ng2-region > div.cdk-global-overlay-wrapper > div > mat-dialog-container > ng-component > div.mat-dialog-content > form > mat-form-field > div > div.mat-form-field-flex > div.mat-form-field-infix > span > label'
        await page.waitForSelector(projectIdInputSelector)
        await page.type(projectIdInputSelector, projectId)

        const deleteProjectButtonSelector = 'body > div.cdk-overlay-container.cfc-ng2-region > div.cdk-global-overlay-wrapper > div > mat-dialog-container > ng-component > div.mat-dialog-actions > button:nth-child(2)'
        await page.waitForSelector(deleteProjectButtonSelector)
        await page.click(deleteProjectButtonSelector)

        await page.waitFor(1000)

        const dateToDeleteSelector = 'body > div.cdk-overlay-container.cfc-ng2-region > div.cdk-global-overlay-wrapper > div > mat-dialog-container > ng-component > div.mat-dialog-content > p'
        await page.waitForSelector(dateToDeleteSelector)
        const dateToDelete = await page.evaluate((dateToDeleteSelector) => {
            let messageText = document.querySelector(dateToDeleteSelector).innerHTML
            messageText = messageText.substring(messageText.lastIndexOf(' ') + 1, messageText.length - 1)

            return messageText
        }, dateToDeleteSelector)

        const buttonOkSelector = 'body > div.cdk-overlay-container.cfc-ng2-region > div.cdk-global-overlay-wrapper > div > mat-dialog-container > ng-component > div.mat-dialog-actions > button'
        await page.waitForSelector(buttonOkSelector)
        await page.click(buttonOkSelector)

        console.log(`> project ${projectId} is gonna be deleted on ${dateToDelete}`)
    }

    await page.waitFor(1000)

    console.log('\n> all projects were excluded')
}

module.exports = { destroyAllProjects }