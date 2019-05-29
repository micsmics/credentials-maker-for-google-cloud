const googleAccountPassword = require('../credentials/google-account.json').password
const state = require('./state.js')
const settings = require('./settings.json')

async function loginGoogleApiConsole(userName, page) {
    const startPage = 'https://console.developers.google.com/projectcreate?previousPage=%2Fprojectselector2%2Fapis%2Fdashboard%3Fhl%3Dpt-br%26organizationId%3D0%26supportedpurview%3Dproject&project=&folder=&organizationId=0&hl=pt-br&supportedpurview=project'
    
    await page.goto(startPage)

    const emailSelector = '#identifierId'
    await page.waitForSelector(emailSelector)
    await page.type(emailSelector, userName)
    
    const nextSelector = '#identifierNext'
    await page.waitForSelector(nextSelector)
    await page.click(nextSelector)

    const passdSelector = "input[name='password']"
    await page.waitForSelector(passdSelector)
    await page.waitFor(3000)
    await page.type(passdSelector, googleAccountPassword)
    
    const loginSelector = "#passwordNext"
    await page.waitForSelector(loginSelector)
    await page.click(loginSelector)
    
    console.log('> login completed')
}

async function createAProject(page, project) {
    const projectNameInputSelector = '#p6ntest-name-input'
    const projectName = await generateProjectName()
    await page.waitForSelector(projectNameInputSelector)
    await page.type(projectNameInputSelector, projectName)
    await page.waitFor(3000)

    const innerHTMLProjectName = await page.evaluate(() => {
        return document.querySelector('#mat-hint-2').innerHTML
    })

    let projectNameId = innerHTMLProjectName.substring(innerHTMLProjectName.indexOf('<strong>') + 9)
    projectNameId = projectNameId.substring(0, projectNameId.indexOf('.</strong>'))
    
    const buttonCreateProjectSelector = '#p6ntest-project-create-page > cfc-panel-body > div > div > proj-creation-form > form > button:nth-child(6)'
    await page.waitForSelector(buttonCreateProjectSelector)
    await page.click(buttonCreateProjectSelector)

    await page.waitFor(5000)
    
    console.log(`> project created with name ${projectName}`)

    project.id = projectNameId
    project.name = projectName
}

async function enableYouTubeApiAndServices(page, project) {
    await page.goto(`https://console.developers.google.com/apis/library?folder=&hl=pt-br&organizationId=&project=${project.id}&supportedpurview=project`)

    await page.waitFor(5000)

    const linkHandlers = await page.$x("//h3[contains(text(), 'YouTube Data API v3')]");
    if (linkHandlers.length > 0) {
        await linkHandlers[0].click();
    } else {
        throw new Error("YouTube Data API Link not found");
    }

    await page.waitFor(8000)

    const activateButtonYouTubeApiSelector = '#p6n-mp-enable-api-button'
    await page.waitForSelector(activateButtonYouTubeApiSelector)
    await page.click(activateButtonYouTubeApiSelector)

    console.log('> youtube api and services enabled')

    await page.waitFor(8000)
}

async function createOAuthConsentScreen(page, project) {
    await page.goto(`https://console.developers.google.com/apis/credentials/consent?project=${project.id}&hl=pt-br&supportedpurview=project`);
                      
    const projectNameSelector = '#p6n-consent-product-name'
    await page.waitForSelector(projectNameSelector)
    await page.type(projectNameSelector, project.name);

    await page.waitFor(2000)
    
    const saveButtonSelector = '#api-consent-save'
    await page.waitForSelector(saveButtonSelector)
    await page.click(saveButtonSelector)

    console.log('> oauth consent screen created')

    await page.waitFor(5000)
}

async function createCredential(page, project) {
    await page.goto(`https://console.developers.google.com/apis/credentials/oauthclient?project=${project.id}&hl=pt-br&supportedpurview=project`)

    const checkboxAppTypeSelector = 'body > pan-shell > div > div.pan-shell-console-nav-container > pan-upgrade-panel-container > div > ng-transclude > div.pan-shell-help-sibling-panel.pan-upgrade-panel.pan-upgrade-panel-fill.pan-upgrade-panel-open.pan-upgrade-panel-color-white > div > div > ng-transclude > pan-upgrade-panel-container > div > ng-transclude > div.pan-shell-dev-shell-sibling-panel.pan-upgrade-panel.pan-upgrade-panel-fill.pan-upgrade-panel-open.pan-upgrade-panel-color-white > div > div > ng-transclude > div > pan-upgrade-panel-container > div > ng-transclude > div.pan-shell-section-nav-sibling-panel.pan-upgrade-panel.layout-row.pan-upgrade-panel-fill.pan-upgrade-panel-open.pan-upgrade-panel-color-white > div > div > ng-transclude > div > div.layout-column.flex > div > md-content > div > div.p6ntest-ngview-container.p6n-hidden-while-loading.layout-column.flex.p6n-hide-router-root > div > div.p6n-inline-grid-row > form > fieldset > div > div > label:nth-child(1) > span'
    await page.waitForSelector(checkboxAppTypeSelector)
    await page.click(checkboxAppTypeSelector)

    const nameOAuthClientIdSelector = 'body > pan-shell > div > div.pan-shell-console-nav-container > pan-upgrade-panel-container > div > ng-transclude > div.pan-shell-help-sibling-panel.pan-upgrade-panel.pan-upgrade-panel-fill.pan-upgrade-panel-open.pan-upgrade-panel-color-white > div > div > ng-transclude > pan-upgrade-panel-container > div > ng-transclude > div.pan-shell-dev-shell-sibling-panel.pan-upgrade-panel.pan-upgrade-panel-fill.pan-upgrade-panel-open.pan-upgrade-panel-color-white > div > div > ng-transclude > div > pan-upgrade-panel-container > div > ng-transclude > div.pan-shell-section-nav-sibling-panel.pan-upgrade-panel.layout-row.pan-upgrade-panel-fill.pan-upgrade-panel-open.pan-upgrade-panel-color-white > div > div > ng-transclude > div > div.layout-column.flex > div > md-content > div > div.p6ntest-ngview-container.p6n-hidden-while-loading.layout-column.flex.p6n-hide-router-root > div > div.p6n-inline-grid-row > form > oauth-client-editor > fieldset > ng-form > div > label > div.p6n-form-row-input > input'
    await page.waitForSelector(nameOAuthClientIdSelector)
    await page.click(nameOAuthClientIdSelector, {clickCount: 3})
    await page.type(nameOAuthClientIdSelector, project.name)

    const redirectionUriSelector = 'body > pan-shell > div > div.pan-shell-console-nav-container > pan-upgrade-panel-container > div > ng-transclude > div.pan-shell-help-sibling-panel.pan-upgrade-panel.pan-upgrade-panel-fill.pan-upgrade-panel-open.pan-upgrade-panel-color-white > div > div > ng-transclude > pan-upgrade-panel-container > div > ng-transclude > div.pan-shell-dev-shell-sibling-panel.pan-upgrade-panel.pan-upgrade-panel-fill.pan-upgrade-panel-open.pan-upgrade-panel-color-white > div > div > ng-transclude > div > pan-upgrade-panel-container > div > ng-transclude > div.pan-shell-section-nav-sibling-panel.pan-upgrade-panel.layout-row.pan-upgrade-panel-fill.pan-upgrade-panel-open.pan-upgrade-panel-color-white > div > div > ng-transclude > div > div.layout-column.flex > div > md-content > div > div.p6ntest-ngview-container.p6n-hidden-while-loading.layout-column.flex.p6n-hide-router-root > div > div.p6n-inline-grid-row > form > oauth-client-editor > fieldset > div > section > div > apiui-redirect-uris > form > fieldset > div > div > div > input'
    await page.waitForSelector(redirectionUriSelector)
    await page.type(redirectionUriSelector, 'http://localhost:5000/oauth2callback')

    const createOAuthClientButtonSelector = 'body > pan-shell > div > div.pan-shell-console-nav-container > pan-upgrade-panel-container > div > ng-transclude > div.pan-shell-help-sibling-panel.pan-upgrade-panel.pan-upgrade-panel-fill.pan-upgrade-panel-open.pan-upgrade-panel-color-white > div > div > ng-transclude > pan-upgrade-panel-container > div > ng-transclude > div.pan-shell-dev-shell-sibling-panel.pan-upgrade-panel.pan-upgrade-panel-fill.pan-upgrade-panel-open.pan-upgrade-panel-color-white > div > div > ng-transclude > div > pan-upgrade-panel-container > div > ng-transclude > div.pan-shell-section-nav-sibling-panel.pan-upgrade-panel.layout-row.pan-upgrade-panel-fill.pan-upgrade-panel-open.pan-upgrade-panel-color-white > div > div > ng-transclude > div > div.layout-column.flex > div > md-content > div > div.p6ntest-ngview-container.p6n-hidden-while-loading.layout-column.flex.p6n-hide-router-root > div > div.p6n-inline-grid-row > form > div > div > button'
    await page.waitForSelector(createOAuthClientButtonSelector)
    await page.click(createOAuthClientButtonSelector)

    console.log('> credential created')
    
    await page.waitFor(5000)

    const clientIdCredential = await page.evaluate(() => {
        return document.querySelector('#dialogContent_1 > div > span > span > ng-transclude').innerHTML.trim()
    })

    const secretKey = await page.evaluate(() => {
        return document.querySelector('#dialogContent_1 > div > div > span > span > ng-transclude').innerHTML.trim()
    })

    let credential = settings.credentialPattern
    credential.web.client_id = clientIdCredential
    credential.web.project_id = project.id
    credential.web.client_secret = secretKey


    const startPage = 'https://console.developers.google.com/projectcreate?previousPage=%2Fprojectselector2%2Fapis%2Fdashboard%3Fhl%3Dpt-br%26organizationId%3D0%26supportedpurview%3Dproject&project=&folder=&organizationId=0&hl=pt-br&supportedpurview=project'
    await page.goto(startPage)

    return credential
}


async function generateProjectName() {
    const wordsList = await state.load(__dirname + '/words.json').wordsList

    const firstWordNumber = Math.floor(Math.random() * wordsList.length)
    const secondWordNumber = Math.floor(Math.random() * wordsList.length)
    let firstWord = wordsList[firstWordNumber]
    let secondWord = wordsList[secondWordNumber]

    firstWord = firstWord[0].toUpperCase() + firstWord.substring(1)
    secondWord = secondWord[0].toUpperCase() + secondWord.substring(1)
    
    const projectName = firstWord + secondWord

    return projectName
}

module.exports = {
    loginGoogleApiConsole,
    createAProject,
    enableYouTubeApiAndServices,
    createOAuthConsentScreen,
    createCredential
}