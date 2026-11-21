[inputs] | to_entries
| reduce .[] as $e (
    {lastEdit: -1, reviewId: null, reviewLine: -1, reviewer: null, verdict: null};
    . as $acc
    | ($e.value.message.content) as $raw
    | (if ($raw | type) == "array" then $raw else [] end) as $content
    | if $e.value.type == "assistant" then
        reduce $content[] as $c ($acc;
          if $c.type == "tool_use" and ($c.name == "Edit" or $c.name == "Write")
             and (($c.input.file_path // "") | test("/src/.*\\.ts$")) then
            .lastEdit = $e.key
          elif $c.type == "tool_use" and $c.name == "Agent"
             and $c.input.subagent_type == "todo-api-reviewer" then
            .reviewId = $c.id | .reviewLine = $e.key | .reviewer = "todo-api-reviewer" | .verdict = null
          elif $c.type == "tool_use" and $c.name == "Bash"
             and (($c.input.command // "") | test("^\\s*\\.claude/codex-review\\.sh(\\s|$)")) then
            .reviewId = $c.id | .reviewLine = $e.key | .reviewer = "codex" | .verdict = null
          else . end
        )
      elif $e.value.type == "user" and $acc.reviewId != null then
        reduce $content[] as $c ($acc;
          if $c.type == "tool_result" and $c.tool_use_id == $acc.reviewId
             and ($c.is_error // false) == false then
            (if ($c.content | type) == "array"
             then [$c.content[]? | (.text? // empty)] | join("\n")
             else ($c.content // "") end) as $t
            | ([$t | split("\n")[]
                | capture("^\\s*REVIEW_VERDICT: (?<v>PASS|FAIL)\\s*$")?
                | .v] | last) as $v
            | .verdict = ($v // .verdict)
          else . end
        )
      else $acc end
  )
