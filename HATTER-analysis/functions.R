


#FUNCTION LOADFILE (takes single filename extracts 3 df)
LOADFILE <- function(filename)
{
  
  print(":: NOW READING :: ")
  #start by clearing old data
  rm(df_files, df_meta, df_structure, df_windows, df_tabs, df_navigation) #will throw warning first time
  
  file = paste("logs/",filename,sep = "")
  print(file)
  
  #READ JSON FROM ONE FILE 
  logfile <- stream_in(file(file))
  logdf <- data.frame(logfile$data$data)
  logdf <- as_tibble(logdf)  
  
  #DISCOVER TABLE DIMS
  n_nav = dim(logdf$rows[[1]])[1]
  n_struct = dim(logdf$rows[[2]])[1]
  n_meta = dim(logdf$rows[[3]])[1]
  
  #EXTRACT META DF [1 PER RECORD] #################################################
  if(n_meta != 0){
    L <- logdf$tableName == "meta" #define logical vector
    df_meta <- logdf[L,] %>% select("rows") #filter for 'meta' row
    df_meta <- data.frame(df_meta$rows) #extract only "rows" col
    df_meta$time <-df_meta$id #rename id
    # df_meta <- df_meta %>% select(-X.types) # remove unecessary col
    df_meta <- df_meta %>% select(-id) # remove unecessary col
    
    if (is.null(df_meta$X.types) == FALSE)
    { df_meta <- df_meta %>% select(-X.types) # remove unecessary col 
    }
    if (is.data.frame(df_meta$data))
    {
      df_meta$email <- df_meta$data$user$email[1]
      df_meta$user <- df_meta$data$user$id[1]
      df_meta$extension <- df_meta$data$extension[1]
      df_meta$userAgent <- df_meta$data$userAgent[1]
      df_meta <- df_meta %>% select(-data)
    } else if (is.list(df_meta$data))
    {
      df_meta <- df_meta  %>% unnest_wider(data) #un-nest data 
      df_meta <- df_meta %>% select(-...1) # remove unecessary col 
      df_meta <- df_meta  %>% unnest_wider(user, names_sep = "_") #un-nest user 
      df_meta <- df_meta %>% select(-user_...1) # remove unecessary col 
      df_meta$email <- df_meta$user_email[1]
      df_meta$user <- df_meta$user_id[1]
      df_meta <- df_meta %>% select(-user_email) # remove unecessary col 
      df_meta <- df_meta %>% select(-user_id) # remove unecessary col 
      df_meta$extension <- df_meta$extension[1]
      df_meta$userAgent <- df_meta$userAgent[1]
    }
    
    #SET FILE LEVEL VARS 
    this_user <-df_meta$user[1]
    this_start <- df_meta$time[1]
    this_end <- df_meta$time[nrow(df_meta)]
    df_meta <- as_tibble(df_meta)
    
    #DF STRUCTURE CHECKS 
    if (is.null (df_meta$time)) {stop("PROBLEM | No time in meta : ",file) }
    if (is.null (df_meta$handler)) {stop("PROBLEM | No handler in meta : ",file) }
    if (is.null (df_meta$event)) {stop("PROBLEM | No event in meta : ",file) }
    if (is.null (df_meta$email)) {stop("PROBLEM | No email in meta : ",file) }
    if (is.null (df_meta$user)) {stop("PROBLEM | No user in meta : ",file) }
    if (is.null (df_meta$extension)) {stop("PROBLEM | No extension# in meta : ",file) }
    if (is.null (df_meta$userAgent)) {stop("PROBLEM | No userAgent in meta : ",file) }
    if (is.null (df_meta$result)) {df_meta$result <- NA
    warning("Setting meta <result> to NULL: ", file)}
  } else {stop("PROBLEM! No content in meta import: ",file )}

  
  #EXTRACT STRUCTURE DF [1 PER RECORD] #################################################
  if (n_struct !=0 ){ 
    L <- logdf$tableName == "structure" #define logical vector
    df_structure <- logdf[L,] %>% select("rows") #filter for 'structure' row
    df_structure <- data.frame(df_structure$rows) #extract only "rows" col
    df_structure$user <- this_user #permeate user
    df_structure$time <- df_structure$data$result$time #hoist time
    df_structure$result <-df_structure$data$result$result#hoist result as list
    df_structure <- df_structure %>% rename(
      window = result )
    df_structure <- as_tibble(df_structure)
    
    #CREATE WINDOWS TABLE
    df_windows <- as.data.frame(cbind("user"=df_structure$user,
                                      "time"=df_structure$time,
                                      "window"=df_structure$window))
    df_windows <- df_windows %>% unnest(window) #unnest windows
    df_windows$user <- as.character(df_windows$user) #not auto to char for some reason
    df_windows$time <- as.numeric(df_windows$time)
    df_windows <- df_windows %>% rename(windowID = id)
    df_windows <-as_tibble(df_windows)
    
    #CREATE TABS TABLE
    df_tabs <- as.data.frame(cbind("user"=df_windows$user,
                                   "time"=df_windows$time,
                                   "tab"=df_windows$tabs))
    df_tabs <- df_tabs %>% unnest(tab)
    df_tabs$user <- as.character(df_tabs$user) #not auto to char for some reason
    df_tabs$time <- as.numeric(df_tabs$time)
    
    if(!is.null(df_tabs$id)){df_tabs <- df_tabs %>% rename(tabID = id)}
    if(!is.null(df_tabs$windowId)){df_tabs <- df_tabs %>% rename(windowID = windowId)}
    if(!is.null(df_tabs$openerTabId)){df_tabs <- df_tabs %>% rename(openerTabID = openerTabId)}
    
    df_tabs <- as_tibble(df_tabs)
    
    #CLEANUP
    df_structure <- df_structure %>% select (-id, -window, -data)
    df_windows <-df_windows %>%  select(-tabs)
    df_tabs <- df_tabs %>%  select (-favIconUrl, -mutedInfo, -autoDiscardable, -audible, -incognito)  
    
    #CHECK TABLE STRUCTURE
    if (is.null (df_structure$time)) {stop("PROBLEM | No TIME in structure : ",file) }
    if (is.null (df_structure$handler)) {stop("PROBLEM | No HANDLER in structure : ",file) }
    if (is.null (df_structure$event)) {stop("PROBLEM | No EVENT in structure : ",file) }
    if (is.null (df_structure$user)) {stop("PROBLEM | No USER in structure : ",file) }
  }
  
  
  #EXTRACT NAVIGATION DF [1 PER RECORD] #################################################
  if (n_nav !=0 ){
    L <- logdf$tableName == "navigation" #define logical vector
    df_navigation <- logdf[L,] %>% select("rows") #filter for 'navigation' row
    df_navigation <- data.frame(df_navigation$rows) #extract only "rows" col
    df_navigation$user <- this_user
    df_navigation <- df_navigation %>% rename(time = id)
    
    #HANDLE ATOMIC DATA
    df_navigation$tabId <- df_navigation$data$tabId
    df_navigation$frameId <- df_navigation$data$frameId
    df_navigation$parentFrameId <- df_navigation$data$parentFrameId
    df_navigation$processId <- df_navigation$data$processId
    df_navigation$timestamp <- df_navigation$data$timeStamp
    df_navigation$transitionType <- df_navigation$data$transitionType
    df_navigation$url <- df_navigation$data$url
    
    #HANDLE NESTED DATAFRAMES
    if( !is.null(df_navigation$data$tab) && is.data.frame(df_navigation$data$tab)){  
      navtabs <- df_navigation$data$tab 
      if(!is.null(df_navigation$data$tab$mutedInfo)){
        navtabs <- navtabs %>% select(-mutedInfo)
      }
      if(!is.null(df_navigation$data$tab$favIconUrl)){
        navtabs <- navtabs %>% select(-favIconUrl)
      }
      if(!is.null(df_navigation$data$tab$autoDiscardable)){
        navtabs <- navtabs %>% select(-autoDiscardable)
      }
      if(!is.null(df_navigation$data$tab$audible)){
        navtabs <- navtabs %>% select(-audible)
      }
      if(!is.null(df_navigation$data$tab$incognito)){
        navtabs <- navtabs %>% select(-incognito)
      }
      df_navigation <- cbind(df_navigation, "tab"=navtabs)
    }
    if( !is.null(df_navigation$data$changeInfo) && is.data.frame(df_navigation$data$changeInfo)){
      navchangeInfo <- df_navigation$data$changeInfo  
      df_navigation <- cbind(df_navigation,"changeInfo"=navchangeInfo)
    }
    if( !is.null(df_navigation$data$activeInfo) && is.data.frame(df_navigation$data$activeInfo)){
      navactiveinfo <- df_navigation$data$activeInfo
      df_navigation <- cbind(df_navigation, "activeInfo"=navactiveinfo)
    }
    if( !is.null(df_navigation$data$DELTAS) && is.data.frame(df_navigation$data$DELTAS)){
      navdeltas <- df_navigation$data$DELTAS
      df_navigation <- cbind(df_navigation,  "deltas"=navdeltas)
    }
    
    # if(!is.null(df_navigation$data$tab)){  
    #   navtabs <- df_navigation$data$tab 
    #   if(!is.null(df_navigation$data$tab$mutedInfo)){
    #     navtabs <- navtabs %>% select(-mutedInfo)
    #   }
    #   if(!is.null(df_navigation$data$tab$favIconUrl)){
    #     navtabs <- navtabs %>% select(-favIconUrl)
    #   }
    #   if(!is.null(df_navigation$data$tab$autoDiscardable)){
    #     navtabs <- navtabs %>% select(-autoDiscardable)
    #   }
    #   if(!is.null(df_navigation$data$tab$audible)){
    #     navtabs <- navtabs %>% select(-audible)
    #   }
    #   if(!is.null(df_navigation$data$tab$incognito)){
    #     navtabs <- navtabs %>% select(-incognito)
    #   }
    #   df_navigation <- cbind(df_navigation, "tab"=navtabs)
    # }
    # if(!is.null(df_navigation$data$changeInfo)){
    #   navchangeInfo <- df_navigation$data$changeInfo  
    #   df_navigation <- cbind(df_navigation,"changeInfo"=navchangeInfo)
    # }
    # if(!is.null(df_navigation$data$activeInfo)){
    #   navactiveinfo <- df_navigation$data$activeInfo
    #   df_navigation <- cbind(df_navigation, "activeInfo"=navactiveinfo)
    # }
    # if(!is.null(df_navigation$data$DELTAS)){
    #   navdeltas <- df_navigation$data$DELTAS
    #   df_navigation <- cbind(df_navigation,  "deltas"=navdeltas)
    # }
    
    #HANDLE NESTED LISTS
    
    #transitionQualifiers
    if(!is.null(df_navigation$data$transitionQualifiers)){
      navtransition <- df_navigation %>% select(user, time, data)
      navtransition$transitionQualifier <-navtransition$data$transitionQualifiers  
      navtransition <- navtransition %>% select(-data)
      navtransition <- navtransition %>% unnest_wider(transitionQualifier)
      if (ncol(navtransition) > 2) #there was something to unnest
      {
        navtransition$...1 <- replace_na(navtransition$...1, "")
        navtransition$...2 <- replace_na(navtransition$...2, "")
        navtransition$transitionQualifier = paste(navtransition$...1, navtransition$...2, sep=";")
        navtransition$transitionQualifier <- recode(navtransition$transitionQualifier, ";" = "")
      } else {
        navtransition$transitionQualifier <- NA
      }
      navtransition <- navtransition %>% select(transitionQualifier)
      df_navigation <- cbind(df_navigation,  "transQualifiers"=navtransition)
    }
    
    #windowId
    if(!is.null(df_navigation$data$windowId)){
      navwindow <- df_navigation %>% select(user, time, data)
      navwindow$window <- navwindow$data$windowId
      navwindow <- navwindow %>% select(-data)
      navwindow <- navwindow %>% unnest_wider(window)
      navwindow <- navwindow %>% rename("windowID" = ...1)
      navwindow <-  navwindow %>% select(-user,-time)
      df_navigation <- cbind(df_navigation,   "window"=navwindow)
    }
    
    #RE-ASSEMBLE TABLE
    df_navigation <- df_navigation %>% select (-data) #cut data column
    # df_navigation <- df_navigation %>%
    # mutate(across(everything(), ~replace_na(.x, "NULL")))
    df_navigation <- as_tibble(df_navigation)
    
    
    #CHECK TABLE STRUCTURE
    if (is.null (df_navigation$time)) {stop("PROBLEM | No TIME in nav : ",file) }
    if (is.null (df_navigation$handler)) {stop("PROBLEM | No handler in nav : ",file) }
    if (is.null (df_navigation$event)) {stop("PROBLEM | No event in nav : ",file) }
    if (is.null (df_navigation$user)) {stop("PROBLEM | No user in nav : ",file) }
  }
  print(":: DONE READING :: ")
  print(filename)
  return (latest <- list (df_meta, df_structure, df_windows, df_tabs, df_navigation))
}

#FUNCTION DB IMPORT (takes dfs and imports to DB) 
DBIMPORT <- function(filename){
 
  latest <- LOADFILE(filename)
 
  print("::NOW IMPORTING ::")  
  print(filename)
   
  df_meta       <-latest[[1]]
  df_structure  <- latest[[2]]
  df_windows    <- latest[[3]]
  df_tabs       <- latest[[4]]
  df_navigation <- latest[[5]]
  
  # does current file overlap with existing file?
  #if YES ... fak. need to slice the file, only include non-duplicate entries
  #if NO ... load
      
  #LOAD META
  if ( dbExistsTable(con, "meta") ) {
    n_meta = as.integer(dim(df_meta)[1]) #rows to write
    db_before = as.integer(dbGetQuery(con,  #get curr num rows
                           "SELECT count(*) from meta")[1,1])
    
    result=tryCatch({
      dbWriteTable(con,"meta",df_meta, append = TRUE)
      },
      warning = function(w) {w},
      error = function(e) {e},
      finally = {}
    )
    print("INSERTING META")
    print (result)
   
    db_after = as.integer(dbGetQuery(con,  #get curr num rows
                          "SELECT count(*) from meta")[1,1])
   
    meta_loaded = db_after-db_before
   
    if (meta_loaded != n_meta) {
      warning("WARNING | incomplete load to META ", filename)
    }
    
    
    print("META : ")
    print(meta_loaded)
    print(" records loaded")
  } else {stop("PROBLEM| DB table META doesn't exist")}
  
  #LOAD STRUCTURE
  if ( dbExistsTable(con, "structure") ) {
    
    n_struct = dim(df_structure)[1] #rows to write
    db_before = as.integer(dbGetQuery(con,  #get curr num rows
                           "SELECT count(*) from structure")[1,1])
    result=tryCatch({
      dbWriteTable(con,"structure",df_structure, append = TRUE)},
      warning = function(w) {w},
      error = function(e) {e},
      finally = {}
    )
    print("INSERTING STRUCTURE")
    print (result)
    
    
    db_after = as.integer(dbGetQuery(con,  #get curr num rows
                          "SELECT count(*) from structure")[1,1])
    
    
    structure_loaded = db_after-db_before
    
    if (structure_loaded != n_struct) {
      warning("WARNING | incomplete load to STRUCTURE ", filename)
    }
   
    
    print("STRUCTURE : ")
    print(structure_loaded)
    print(" records loaded")
  } else {stop("PROBLEM| DB table STRUCTURE doesn't exist")}
  
  #LOAD WINDOWS
  if ( dbExistsTable(con, "windows") ) {
    n_windows = dim(df_windows)[1] #rows to write
    db_before = as.integer(dbGetQuery(con,  #get curr num rows
                           "SELECT count(*) from windows")[1,1])
    
    result=tryCatch({
      dbWriteTable(con,"windows",df_windows, append = TRUE)},
      warning = function(w) {w},
      error = function(e) {e},
      finally = {}
    )
    print("INSERTING WINDOWS")
    print (result)
    
    db_after = as.integer(dbGetQuery(con,  #get curr num rows
                          "SELECT count(*) from windows")[1,1])
    windows_loaded = db_after-db_before
    if (windows_loaded != n_windows) {
      warning("WARNING | incomplete load to WINDOWS ", filename)
    }
    
    
    print("WINDOWS : ")
    print(windows_loaded)
    print(" records loaded")
  } else {stop("PROBLEM| DB table WINDOWS doesn't exist")}
  
  #LOAD TABS
  if ( dbExistsTable(con, "tabs") ) {
    n_tabs = dim(df_tabs)[1] #rows to write
    db_before = as.integer(dbGetQuery(con,  #get curr num rows
                           "SELECT count(*) from tabs")[1,1])
    
    result=tryCatch({
      dbWriteTable(con,"tabs",df_tabs, append = TRUE)},
      warning = function(w) {w},
      error = function(e) {e},
      finally = {}
    )
    print("INSERTING TABS")
    print (result)
    
    db_after = as.integer(dbGetQuery(con,  #get curr num rows
                          "SELECT count(*) from tabs")[1,1])
    tabs_loaded = db_after-db_before
    if (tabs_loaded != n_tabs) {
      warning("WARNING | incomplete load to TABS ", filename)
    }
    
    print("TABS : ")
    print(tabs_loaded)
    print(" records loaded")
  } else {stop("PROBLEM| DB table TABS doesn't exist")}
  
  #LOAD NAVIGATION
  if ( dbExistsTable(con, "navigation") ) {
    n_navigation = dim(df_navigation)[1] #rows to write
    db_before = as.integer(dbGetQuery(con,  #get curr num rows
                           "SELECT count(*) from navigation")[1,1])
    
    result=tryCatch({
      dbWriteTable(con,"navigation",df_navigation, append = TRUE)},
      warning = function(w) {w},
      error = function(e) {e},
      finally = {}
    )
    print("INSERTING NAVIGATION")
    print (result)
    
    db_after = as.integer(dbGetQuery(con,  #get curr num rows
                          "SELECT count(*) from navigation")[1,1])
    navigation_loaded = db_after-db_before
    if (navigation_loaded != n_navigation) {
      warning("WARNING | incomplete load to NAVIGATION ", filename)
    }
    
    print("NAVIGATION : ")
    print(navigation_loaded)
    print(" records loaded")
  } else {stop("PROBLEM| DB table NAVIGATION doesn't exist")}
  
  #CREATE FILE-RECORD [1]
  df_files = data.frame(NA)
  df_files$file = filename
  df_files$user = df_meta$user[1]
  df_files$start = df_meta$time[1]
  df_files$end = df_meta$time[nrow(df_meta)]
  df_files$n_meta =  dim(df_meta)[1] #rows to write
  df_files$n_nav =  dim(df_navigation)[1] #rows to write
  df_files$n_struct= dim(df_structure)[1] #rows to write
  df_files$n_windows= dim(df_windows)[1]
  df_files$n_tabs= dim(df_tabs)[1] #rows to write
  df_files$l_meta =  meta_loaded
  df_files$l_nav =  navigation_loaded
  df_files$l_struct= structure_loaded
  df_files$l_windows= windows_loaded
  df_files$l_tabs=   tabs_loaded
  df_files <- df_files %>% select(-"NA.")
  
  #LOAD FILE-RECORD
  if ( dbExistsTable(con, "files") ) {
    
    db_before = as.integer(dbGetQuery(con,  #get curr num rows
                           "SELECT count(*) from files")[1,1])
    result=tryCatch({
      dbWriteTable(con,"files",df_files, append = TRUE)},
      warning = function(w) {w},
      error = function(e) {e},
      finally = {}
    )
    print("INSERTING FILE")
    print (result)
    
    db_after = as.integer(dbGetQuery(con,  #get curr num rows
                          "SELECT count(*) from files")[1,1])
    
    if (db_after-db_before != 1) {
      warning("FAILED | load to FILE-RECORD (may be dup)", filename)
    }
    
    
    print("FILE-RECORD : ")
    print(db_after-db_before)
    print(" records loaded")
  } else {warning("PROBLEM| DB table FILES doesn't exist")}
  
  print("::DONE IMPORTING ::")  
  print(filename)
}

#FUNCTION LOADALL (reads files from log dir and imports to DB)
LOADALL <- function(){
  #GET list of files 
  files = list.files("./logs")
  
  # #CONNECT to database
  # con <- DBI::dbConnect(odbc::odbc(),
  #                       Driver   = "/usr/local/mysql-connector-odbc-8.0.21-macos10.15-x86-64bit/lib/libmyodbc8a.so",
  #                       Server   = "127.0.0.1",
  #                       Database = "hatter",
  #                       UID      = rstudioapi::askForPassword("Database user"),
  #                       PWD      = rstudioapi::askForPassword("Database password"),
  #                       Port     = 3306)
  
  #LOAD THE FILES
  lapply (files, FUN=DBIMPORT)
}

#FUNCTION NEW (loads files to DB that are not already there)
# LOADNEW <- function(){
#   
#   #list files in dir
#   inDIR =   files = list.files("./logs")
# 
#   #get files from db
#   dbGetQuery(con, "SELECT file from hatter.files;")
#   
#   
#   
#   #select files from DIR NOT in DB
#   
#   #update files df
#   
#   
#   
# }