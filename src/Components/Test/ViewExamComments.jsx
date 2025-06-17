import React from "react";
import { motion } from "framer-motion";
import { Edit2, Plus, X, MessageSquare, User, Mail } from "lucide-react";

const ViewExamComments = ({
    comments,
    isAddingComment,
    userRole,
    commentFields,
    handleAddComment,
    handleEditCommentClick,
    setIsAddingComment,
    Form,
    onCloseMobile,
}) => {
    const canEdit = userRole === "admin" || userRole === "teacher";
    const isMobile = window.innerWidth < 768;

    // Animaciones
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const commentVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.1,
                ease: "easeOut"
            }
        },
        hover: {
            y: -2,
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)"
        }
    };

    const buttonVariants = {
        hover: {
            scale: 1.05,
            backgroundColor: "#059669"
        },
        tap: { scale: 0.98 }
    };

    return (
        <motion.div
            className="p-6 overflow-y-auto max-h-[90vh] relative bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.1, ease: "easeInOut" }}
        >
            {/* Header */}
            <motion.div
                className="flex items-center justify-between mb-6 sticky top-0 backdrop-blur-sm bg-white/70 z-10 py-3 px-4 rounded-xl border border-white/20 shadow-sm"
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
            >
                <div className="flex items-center space-x-3">
                    <MessageSquare className="text-indigo-600 w-6 h-6" />
                    <h3 className="text-xl font-bold text-gray-800">Exam Comments</h3>
                </div>

                {isMobile && onCloseMobile && (
                    <motion.button
                        onClick={onCloseMobile}
                        className="text-gray-500 hover:text-gray-800 p-2 rounded-full transition"
                        whileHover={{ rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <X className="w-5 h-5" />
                    </motion.button>
                )}
            </motion.div>

            {isAddingComment ? (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.1 }}
                    className="mb-6"
                >
                    <Form
                        fields={commentFields}
                        onSubmit={handleAddComment}
                        onCancel={() => setIsAddingComment(false)}
                        submitText="Post Comment"
                        layout="grid-cols-1"
                    />
                </motion.div>
            ) : comments.length > 0 ? (
                <motion.div
                    className="space-y-5"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {comments.map((comment, index) => (
                        <motion.div
                            key={comment.pk_comment}
                            className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:border-indigo-100 transition-all duration-100 relative overflow-hidden"
                            variants={commentVariants}
                            whileHover="hover"
                        >
                            {/* Efecto de acento */}
                            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 rounded-l-xl" />

                            <div className="flex flex-col">
                                {/* Encabezado del comentario */}
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center mb-3">
                                        <div className="bg-indigo-100 p-2 rounded-full mr-3">
                                            <User className="w-4 h-4 text-indigo-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900">
                                                {comment.comment_title}
                                            </h4>
                                            <div className="flex flex-wrap items-center text-xs text-gray-500 space-x-2">
                                                <span>{comment.author}</span>
                                                {comment.author_email && (
                                                    <>
                                                        <span>•</span>
                                                        <div className="flex items-center">
                                                            <Mail className="w-3 h-3 mr-1" />
                                                            <span className="break-all">{comment.author_email}</span>
                                                        </div>
                                                    </>
                                                )}
                                                <span>•</span>
                                                <span>
                                                    {new Date(comment.created_at).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {canEdit && (
                                        <motion.button
                                            onClick={() => handleEditCommentClick(comment)}
                                            className="text-indigo-500 hover:text-indigo-700 ml-4 transition duration-200 p-1 rounded-full hover:bg-indigo-50 self-start"
                                            title="Edit Comment"
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <Edit2 className="w-5 h-5" />
                                        </motion.button>
                                    )}
                                </div>

                                {/* Cuerpo del comentario con ajuste para texto largo */}
                                <div className="flex">
                                    <div className="ml-11 pl-1 border-l-2 border-indigo-100 min-w-0">
                                        <p className="text-gray-700 break-words whitespace-pre-wrap">
                                            {comment.comment_value}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {canEdit && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="pt-2"
                        >
                            <motion.button
                                onClick={() => setIsAddingComment(true)}
                                className="w-full flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-6 py-3 rounded-xl shadow-md transition-colors"
                                variants={buttonVariants}
                                whileHover="hover"
                                whileTap="tap"
                            >
                                <Plus className="w-5 h-5" />
                                <span>Add New Comment</span>
                            </motion.button>
                        </motion.div>
                    )}
                </motion.div>
            ) : (
                <motion.div
                    className="text-center py-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                        <MessageSquare className="w-8 h-8 text-indigo-500" />
                    </div>
                    <h4 className="text-lg font-medium text-gray-800 mb-2">No comments yet</h4>
                    <p className="text-gray-500 mb-6">
                        {userRole === 'student' ? "No feedback has been added to your exam yet :)" : "Be the first to share your thoughts :)"}
                    </p>

                    {canEdit && (
                        <motion.button
                            onClick={() => setIsAddingComment(true)}
                            className="mx-auto flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-6 py-3 rounded-xl shadow-md"
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                        >
                            <Plus className="w-5 h-5" />
                            <span>Add Comment</span>
                        </motion.button>
                    )}
                </motion.div>
            )}
        </motion.div>
    );
};

export default ViewExamComments;