===============================corner_case====================================
## make sure you put all other elements into a single common parent Node
    use this:---------------> <div><label for='username'>Username:</label><input type='text' name='username'/></div>
    instead of this:-------->      <label for='username'>Username:</label><input type='text' name='username'/>


## make sure you close non-closing elements
    use this:---------------> <input type='text'/>
    instead of this:--------> <input type='text'>


## don't use unnecessery line breaks of attribute's value
    use this:---------------> <input type='text' class='prelative mt05 pt03 hiddenitem'/>
    instead of this:--------> <input type='text' class='prelative
                                 mt05 
                                 pt03 
                                 hiddenitem'
                              />
