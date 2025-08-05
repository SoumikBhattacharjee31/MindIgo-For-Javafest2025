import CheckList from "@/app/quiz/components/CheckList"
import MCQ from "@/app/quiz/components/Mcq"
import RangeInput from "@/app/quiz/components/RangeInput"
const checkListGenerator= (question, options,checkedItems, handleCheckboxChange)=>{
    return (
        <div className="form-transition">
            <CheckList 
                question={question} 
                options={options}
                checkedItems={checkedItems}
                handleCheckboxChange={handleCheckboxChange}
            />
        </div>
    );
}

const sliderGenerator= (question, options)=>{
    
}

const mcqGenerator = (question,  options, selectedOption, setSelectedOption)=>{
    return (
        <div className="form-transition">
            <MCQ 
                question={question} 
                options={options}
                selectedOption={selectedOption}
                onOptionChange={setSelectedOption}
            />
        </div>
    );
}

const rangeGenerator = (question, options, rangeValue, setRangeValue)=>{
    return (
        <div className="form-transition">
            <RangeInput 
                question={question}
                value={rangeValue}
                options={options}
                onChange={setRangeValue}
            />
        </div>
    );
}

const quizGenerator = (type, question, options)=>{
    if(type == "check")
        return checkListGenerator(question, options);
    else if(type == "range")
        return rangeGenerator(question, options);
    else if(type == "mcq")
        return mcqGenerator(question, options);
    else
        return sliderGenerator(question, options);    
}

export {mcqGenerator,rangeGenerator,checkListGenerator}