import { Plugin } from 'januscli';
import fs from 'fs';
import shell from 'shelljs';

const file = '.janus_tasks.yml';

/**
 * Tasks plugin definition
 */

class Tasks extends Plugin {

  constructor(janus) {
    super(janus);
    this.tasks = false;
  }

 /**
  * name() set plugin name
  *
  */

  name() {
    return 'tasks';
  }


/**
  * Event handlers
  *
  */

  events() {
    this.janus.on( this.startEventName(), this.preTasks.bind(this) )
  }

/**
  * CLI options for plugin to
  * respond to.
  *
  */

  cliCommands() {
    return [
      [
        'tasks',
        'Run tasks in project',
        this.name()
      ]
    ]
  }

  /**
  * Perform pre release checks and 
  * start the release if they pass.
  *
  */

  preTasks() {
    if( this.isSetup() ) {
      this.startTasks();
    } else {
      this.handleNoFile();
    }
  }

  /**
  * Perform pre release checks and 
  * start the release if they pass.
  *
  */

  handleNoFile() {
    const that = this;
    const question = [
      {
         type: 'confirm',
         name: 'create_file',
         message: 'Add a ' + file + ' to the current project?',
         default: false
      }
    ];

    this.janus.error(file + ' not found in current project.', false);

    this.janus.inquirer.prompt( question, function( answer ) {
      if(answer.create_file) {
        that.createFile();
        that.preTasks();
      } else {
        process.exit(1);
      }
    });
  }



 /**
  * Start release steps
  *
  */

  createFile() {
    return fs.writeFileSync(
      './' + file,
      '- echo "Hello Janus CLI"'
    );
  }


 /**
  * Start release steps
  *
  */

  startTasks() {
    const that = this;
    this.tasks.split("\n").forEach(function(task) {
      if(task.length === 0) return false;
      const cmd = task.replace('- ','');

      if (shell.exec(cmd).code !== 0) {
        that.janus.error('Error: "' + cmd + '" failed');
      } else {
        that.janus.success('"' + cmd + '" ran successfully');
      }
    });

    this.janus.emit('tasks:complete')
  }

  /**
  * is Plugin Setup?
  *
  */

  isSetup() {
    try {
      this.tasks = fs.readFileSync('./' + file).toString('utf8');
    } catch (e) {
      this.tasks = false;
    }

    return this.tasks;
  }

}

export default Tasks;
