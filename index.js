const settings = require('./utils/settings.json')
const projectCreator = require('./utils/project-creator.js')
const state = require('./utils/state.js')
const puppeteer = require('puppeteer')

async function start() {
    let userName = null

    /* gets account from args */
    if (process.argv.length > 2) {
        userName = process.argv[2]
    }
    else { 
        console.log('\n> enter with a google account email, please.')
        return 
    }

    await createAllProjectsAndCredentials(userName)
    //await deleteAllProjects(userName)

    async function createAllProjectsAndCredentials(userName) {
        (async() => {
            const browser = await puppeteer.launch({
                headless: false
            });
            const page = await browser.newPage();

            await projectCreator.loginGoogleApiConsole(userName, page)

            for (let projectId = 0; projectId < settings.quantityOfProjects; projectId++) {
                console.log(`\n> creating project nº ${projectId}`)

                const project = {}
                await projectCreator.createAProject(page, project)
                await projectCreator.enableYouTubeApiAndServices(page, project)
                await projectCreator.createOAuthConsentScreen(page, project)
                const credential = await projectCreator.createCredential(page, project)
                await state.save(credential, settings.credentialsFilepath + `/${project.name}-${userName}.json`)

                console.log('> project saved')
            }
        
            await browser.close();
        })();
    }
}

start()