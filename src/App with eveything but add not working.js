import logo from './logo.svg';
import "./App.css";
import React, { Component } from "react";
import { API, graphqlOperation } from 'aws-amplify';
import { withAuthenticator, AmplifySignOut } from "@aws-amplify/ui-react";
import { createTodo, deleteTodo, updateTodo } from './graphql/mutations';
import { listNotes, listTodos } from './graphql/queries';
import { onCreateTodo, onDeleteTodo } from './graphql/subscriptions';

// function App() {
//   return (
//     <div className="flex flex-column items-left justify-center pa3 bg-washed-red"> 
//     <AmplifySignOut />
//     <h1 className="code f2-1">Aidan's Amplify Test Notes App </h1>
//       { /* Note Form */}
//       <form className="mb3"><input type="text" className="pa2 f4" placeholder="Write your note here"/>
//       <button className="pa2 f4" type="submit">Add Note</button>
//       </form>
      
//       {/* Notes List */}
//       <div>


//       </div>

//       </div>
//   );
// }



class App extends Component {
  state = { id: "", note: "", notes: []};
  
 componentDidMount() {
this.getNotes();
this.createNoteListener = API.graphql(graphqlOperation(onCreateTodo)).subscribe({ next:noteData => { const newNote =  noteData.value.data.onCreateTodo
const prevNotes = this.state.notes.filter(note => note.id !== newNote.id) 
const updatedNotes = [ ...prevNotes, newNote];
this.setState({notes: updatedNotes})

}});

  }

  componentWillUnmount() {
    this.createNoteListener.unsubscribe();
   }

getNotes = async () => {
  const result = await API.graphql(graphqlOperation(listTodos))
  this.setState({ notes: result.data.listTodos.items});

}

  handleChangeNote = event => this.setState({ note: event.target.value })


  hasExistingNote = () => { const { notes, id} = this.state
if (id) {
const isNote = notes.findIndex(note => note.id === id) > -1
return isNote;
}
return false;
}

handleAddNote = async event => {
  const {note, notes} = this.state;
  event.preventDefault()
  if (this.hasExistingNote()) { this.handleUpdateTodo()
}else {
    const input = {
    note: note
  };
await API.graphql(graphqlOperation(createTodo, { input: input}));
// const newNote = result.data.createTodo;
// const updatedNotes = [newNote, ...notes];
this.setState({note: ""});
}
};

handleUpdateTodo = async () => {
  const { notes, id, note} = this.state;
  const input = { id, note}
  const result = await API.graphql(graphqlOperation(updateTodo, {input}))
  const updatedNote = result.data.updateTodo;
 const index = notes.findIndex(note => note.id === updatedNote.id)
 const updatedNotes = [
   ...notes.slice(0, index),
   updatedNote,
   ...notes.slice(index + 1)
 ]
 this.setState({notes: updatedNotes, note: "", id: ""});
};

handleDeleteTodo = async noteId => {
  const {notes} = this.state;
  const input = { id: noteId} 
const result = await API.graphql(graphqlOperation(deleteTodo, { input})) 
const deletedNoteId = result.data.deleteTodo.id; 
const updatedNotes = notes.filter(note => note.id !== deletedNoteId)
this.setState({notes: updatedNotes});
}

handleSetNote = ({ note, id }) => this.setState({ note, id });

  render() {
    const { id, notes, note } = this.state
    return (
      <div className="flex flex-column items-center justify-center pa3 bg-washed-red"> 
      <AmplifySignOut />
      <h1 className="code f2-1">Aidan's Amplify Test Notes App </h1>
      { /* Note Form */}
      <form onSubmit={this.handleAddNote} className="mb3"><input type="text" className="pa2 f4" placeholder="Write your note here" onChange={this.handleChangeNote} value={note}/>
      <button className="pa2 f4" type="submit"> {id ? "Update Note" : "Add Note"}</button>
       </form>
       {/* Notes List */}
      <div>
        {notes.map(item => ( 
        <div key={item.id} className="flex items-center">
          <li onClick={() => this.handleSetNote(item)} className="list pa1 f3" > 
          {item.note}</li>
          <button onClick={() => this.handleDeleteTodo(item.id)} className="bg-transparent bn f4"><span>&times;</span></button>  

        </div>
        ))}
        </div>
      </div>
    );
  }
}

export default withAuthenticator(App, { includeGreetings: true});
// export default withAuthenticator(App);